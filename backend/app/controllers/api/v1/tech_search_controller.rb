class Api::V1::TechSearchController < ApplicationController
  skip_before_action :authenticate_request, only: [:search_companies, :search_jobs] # Temporarily for testing

  def search_companies
    search_params = params.require(:search).permit(
      :search_mode,
      :min_match_score,
      :company_size,
      :location,
      required_tech: [],
      preferred_tech: [],
      excluded_tech: [],
      categories: []
    )

    # Log the search
    log_search(search_params)

    # Build the search query
    companies = build_company_search_query(search_params)

    # Calculate match scores
    companies_with_scores = companies.map do |company|
      score = calculate_company_match_score(company, search_params)
      {
        company: company,
        match_score: score,
        matching_technologies: get_matching_technologies(company, search_params)
      }
    end

    # Filter by minimum match score
    min_score = search_params[:min_match_score]&.to_f || 0
    companies_with_scores = companies_with_scores.select { |item| item[:match_score] >= min_score }

    # Sort by match score
    companies_with_scores.sort_by! { |item| -item[:match_score] }

    render json: {
      companies: companies_with_scores.map do |item|
        company = item[:company]
        {
          id: company.id,
          name: company.name,
          industry: company.industry,
          location: company.location,
          description: company.description,
          website: company.website,
          match_score: item[:match_score],
          matching_technologies: item[:matching_technologies],
          tech_culture_score: company.tech_culture_score,
          open_source_contributions: company.open_source_contributions,
          tech_blog_url: company.tech_blog_url,
          github_org_url: company.github_org_url,
          main_technologies: company.main_technologies.map do |tech|
            {
              id: tech.id,
              name: tech.name,
              category: tech.category
            }
          end,
          job_postings_count: company.job_postings.active.count
        }
      end,
      search_summary: {
        total_results: companies_with_scores.size,
        search_params: search_params,
        technologies_searched: get_searched_technology_names(search_params)
      }
    }
  end

  def search_jobs
    search_params = params.require(:search).permit(
      :search_mode,
      :min_match_score,
      :employment_type,
      :location,
      required_tech: [],
      preferred_tech: [],
      excluded_tech: []
    )

    jobs = build_job_search_query(search_params)

    jobs_with_scores = jobs.map do |job|
      score = calculate_job_match_score(job, search_params)
      {
        job: job,
        match_score: score,
        matching_technologies: get_job_matching_technologies(job, search_params)
      }
    end

    min_score = search_params[:min_match_score]&.to_f || 0
    jobs_with_scores = jobs_with_scores.select { |item| item[:match_score] >= min_score }
    jobs_with_scores.sort_by! { |item| -item[:match_score] }

    render json: {
      jobs: jobs_with_scores.map do |item|
        job = item[:job]
        {
          id: job.id,
          title: job.title,
          description: job.description,
          location: job.location,
          employment_type: job.employment_type,
          salary_range: job.salary_range,
          deadline: job.deadline,
          match_score: item[:match_score],
          matching_technologies: item[:matching_technologies],
          required_technologies: job.required_technologies.map { |t| { id: t.id, name: t.name, category: t.category } },
          preferred_technologies: job.preferred_technologies.map { |t| { id: t.id, name: t.name, category: t.category } },
          tech_learning_opportunities: job.tech_learning_opportunities,
          company: {
            id: job.company.id,
            name: job.company.name,
            industry: job.company.industry,
            location: job.company.location
          }
        }
      end,
      search_summary: {
        total_results: jobs_with_scores.size,
        search_params: search_params
      }
    }
  end

  private

  def build_company_search_query(search_params)
    companies = Company.includes(:technologies, :company_tech_stacks, :job_postings)

    # Filter by required technologies
    if search_params[:required_tech].present?
      required_tech_ids = search_params[:required_tech].map(&:to_i)
      
      if search_params[:search_mode] == 'AND'
        required_tech_ids.each do |tech_id|
          companies = companies.using_technology(tech_id)
        end
      else
        companies = companies.joins(:company_tech_stacks)
                             .where(company_tech_stacks: { technology_id: required_tech_ids })
                             .distinct
      end
    end

    # Filter by location
    if search_params[:location].present?
      companies = companies.where('location ILIKE ?', "%#{search_params[:location]}%")
    end

    companies.distinct
  end

  def build_job_search_query(search_params)
    jobs = JobPosting.includes(:company, :required_technologies, :preferred_technologies).active

    if search_params[:required_tech].present?
      tech_ids = search_params[:required_tech].map(&:to_i)
      if search_params[:search_mode] == 'AND'
        tech_ids.each do |tech_id|
          jobs = jobs.where('required_tech_ids @> ?', [tech_id].to_json)
        end
      else
        jobs = jobs.where('required_tech_ids && ?', tech_ids.to_json)
      end
    end

    if search_params[:employment_type].present?
      jobs = jobs.where(employment_type: search_params[:employment_type])
    end

    if search_params[:location].present?
      jobs = jobs.where('location ILIKE ?', "%#{search_params[:location]}%")
    end

    jobs
  end

  def calculate_company_match_score(company, search_params)
    score = 0
    max_score = 100

    # Required tech match (60% weight)
    if search_params[:required_tech].present?
      required_tech_ids = search_params[:required_tech].map(&:to_i)
      company_tech_ids = company.technologies.pluck(:id)
      matches = (required_tech_ids & company_tech_ids).size
      
      if search_params[:search_mode] == 'AND'
        score += matches == required_tech_ids.size ? 60 : (matches.to_f / required_tech_ids.size * 40)
      else
        score += (matches.to_f / required_tech_ids.size * 60)
      end
    else
      score += 60
    end

    # Preferred tech match (20% weight)
    if search_params[:preferred_tech].present?
      preferred_tech_ids = search_params[:preferred_tech].map(&:to_i)
      company_tech_ids = company.technologies.pluck(:id)
      matches = (preferred_tech_ids & company_tech_ids).size
      score += (matches.to_f / preferred_tech_ids.size * 20)
    else
      score += 20
    end

    # Tech culture score (10% weight)
    culture_score = company.tech_culture_score || 0
    score += (culture_score / 10.0 * 10)

    # OSS contributions (5% weight)
    oss_score = company.open_source_contributions > 0 ? 5 : 0
    score += oss_score

    # Tech stack freshness (5% weight)
    freshness_score = company.tech_stack_freshness_score
    score += (freshness_score / 10.0 * 5)

    [score, max_score].min.round(2)
  end

  def calculate_job_match_score(job, search_params)
    return job.tech_match_score(search_params[:required_tech]&.map(&:to_i) || [])
  end

  def get_matching_technologies(company, search_params)
    all_search_tech_ids = []
    all_search_tech_ids += search_params[:required_tech].map(&:to_i) if search_params[:required_tech].present?
    all_search_tech_ids += search_params[:preferred_tech].map(&:to_i) if search_params[:preferred_tech].present?
    
    company_tech_ids = company.technologies.pluck(:id)
    matching_ids = all_search_tech_ids & company_tech_ids
    
    Technology.where(id: matching_ids).map do |tech|
      {
        id: tech.id,
        name: tech.name,
        category: tech.category
      }
    end
  end

  def get_job_matching_technologies(job, search_params)
    all_search_tech_ids = []
    all_search_tech_ids += search_params[:required_tech].map(&:to_i) if search_params[:required_tech].present?
    all_search_tech_ids += search_params[:preferred_tech].map(&:to_i) if search_params[:preferred_tech].present?
    
    job_tech_ids = []
    job_tech_ids += job.required_tech_ids || []
    job_tech_ids += job.preferred_tech_ids || []
    
    matching_ids = all_search_tech_ids & job_tech_ids
    
    Technology.where(id: matching_ids).map do |tech|
      {
        id: tech.id,
        name: tech.name,
        category: tech.category
      }
    end
  end

  def get_searched_technology_names(search_params)
    tech_ids = []
    tech_ids += search_params[:required_tech].map(&:to_i) if search_params[:required_tech].present?
    tech_ids += search_params[:preferred_tech].map(&:to_i) if search_params[:preferred_tech].present?
    
    Technology.where(id: tech_ids).pluck(:name)
  end

  def log_search(search_params)
    TechSearchLog.create!(
      user: current_user,
      search_query: search_params.to_json,
      selected_technologies: {
        required: search_params[:required_tech] || [],
        preferred: search_params[:preferred_tech] || [],
        excluded: search_params[:excluded_tech] || []
      },
      search_type: 'company_search',
      match_score_threshold: search_params[:min_match_score]&.to_f
    )
  rescue => e
    Rails.logger.error "Failed to log search: #{e.message}"
  end
end