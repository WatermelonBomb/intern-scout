class Api::V1::StudentTechInterestsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_student_user!
  before_action :set_student_tech_interest, only: [:show, :update, :destroy]

  def index
    @interests = current_user.student_tech_interests.includes(:technology)
    
    if params[:skill_level].present?
      @interests = @interests.by_skill_level(params[:skill_level])
    end
    
    if params[:interest_type].present?
      @interests = @interests.where(interest_type: params[:interest_type])
    end
    
    if params[:category].present?
      @interests = @interests.joins(:technology)
                            .where(technologies: { category: params[:category] })
    end

    case params[:sort]
    when 'priority'
      @interests = @interests.order(learning_priority: :desc)
    when 'name'
      @interests = @interests.joins(:technology).order('technologies.name')
    when 'category'
      @interests = @interests.joins(:technology).order('technologies.category', 'technologies.name')
    else
      @interests = @interests.order(created_at: :desc)
    end

    render json: {
      tech_interests: @interests.map do |interest|
        {
          id: interest.id,
          technology: {
            id: interest.technology.id,
            name: interest.technology.name,
            category: interest.technology.category,
            description: interest.technology.description,
            logo_url: interest.technology.logo_url,
            learning_difficulty: interest.technology.learning_difficulty,
            market_demand_score: interest.technology.market_demand_score
          },
          skill_level: interest.skill_level,
          skill_level_display: interest.skill_level_display,
          learning_priority: interest.learning_priority,
          interest_type: interest.interest_type,
          interest_type_display: interest.interest_type_display,
          created_at: interest.created_at,
          updated_at: interest.updated_at
        }
      end,
      summary: {
        total_interests: current_user.student_tech_interests.count,
        by_skill_level: {
          beginner: current_user.student_tech_interests.by_skill_level('beginner').count,
          intermediate: current_user.student_tech_interests.by_skill_level('intermediate').count,
          advanced: current_user.student_tech_interests.by_skill_level('advanced').count,
          expert: current_user.student_tech_interests.by_skill_level('expert').count
        },
        by_interest_type: {
          want_to_learn: current_user.student_tech_interests.want_to_learn.count,
          experienced: current_user.student_tech_interests.experienced.count
        },
        high_priority_count: current_user.student_tech_interests.high_priority.count
      }
    }
  end

  def show
    render json: {
      tech_interest: format_tech_interest(@interest)
    }
  end

  def create
    @interest = current_user.student_tech_interests.build(tech_interest_params)

    if @interest.save
      render json: {
        message: 'Technology interest added successfully',
        tech_interest: format_tech_interest(@interest)
      }, status: :created
    else
      render json: {
        errors: @interest.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def bulk_create
    interests_data = params.require(:tech_interests)
    
    created_interests = []
    errors = []

    interests_data.each_with_index do |interest_data, index|
      interest = current_user.student_tech_interests.build(interest_data.permit(
        :technology_id, :skill_level, :learning_priority, :interest_type
      ))

      if interest.save
        created_interests << interest
      else
        errors << {
          index: index,
          technology_id: interest_data[:technology_id],
          errors: interest.errors.full_messages
        }
      end
    end

    if errors.empty?
      render json: {
        message: "Successfully added #{created_interests.size} technology interests",
        tech_interests: created_interests.map { |interest| format_tech_interest(interest) }
      }, status: :created
    else
      render json: {
        message: "Partially successful: #{created_interests.size} created, #{errors.size} failed",
        created_interests: created_interests.map { |interest| format_tech_interest(interest) },
        errors: errors
      }, status: :unprocessable_entity
    end
  end

  def update
    if @interest.update(tech_interest_params)
      render json: {
        message: 'Technology interest updated successfully',
        tech_interest: format_tech_interest(@interest)
      }
    else
      render json: {
        errors: @interest.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @interest.destroy
    render json: {
      message: 'Technology interest removed successfully'
    }
  end

  def recommendations
    # Get recommendations based on user's current interests and skill level
    user_tech_ids = current_user.student_tech_interests.pluck(:technology_id)
    user_categories = current_user.student_tech_interests
                                 .joins(:technology)
                                 .pluck('technologies.category')
                                 .uniq

    # Recommend based on combinations with existing interests
    combination_recommendations = []
    user_tech_ids.each do |tech_id|
      combinations = TechCombination.find_combinations_for_tech(tech_id)
      combinations.each do |combo|
        other_tech = combo.primary_tech_id == tech_id ? combo.secondary_tech : combo.primary_tech
        unless user_tech_ids.include?(other_tech.id)
          combination_recommendations << {
            technology: other_tech,
            reason: "Often used with #{Technology.find(tech_id).name}",
            popularity_score: combo.popularity_score,
            type: 'combination'
          }
        end
      end
    end

    # Recommend beginner-friendly technologies in user's interested categories
    beginner_recommendations = Technology.joins("LEFT JOIN student_tech_interests ON technologies.id = student_tech_interests.technology_id AND student_tech_interests.user_id = #{current_user.id}")
                                        .where(student_tech_interests: { id: nil })
                                        .where(category: user_categories)
                                        .beginner_friendly
                                        .popular
                                        .limit(5)
                                        .map do |tech|
      {
        technology: tech,
        reason: "Beginner-friendly in #{tech.category.humanize}",
        popularity_score: tech.popularity_score,
        type: 'beginner_friendly'
      }
    end

    # Recommend trending technologies
    trending_recommendations = Technology.joins("LEFT JOIN student_tech_interests ON technologies.id = student_tech_interests.technology_id AND student_tech_interests.user_id = #{current_user.id}")
                                       .where(student_tech_interests: { id: nil })
                                       .order(market_demand_score: :desc)
                                       .limit(5)
                                       .map do |tech|
      {
        technology: tech,
        reason: "High market demand",
        popularity_score: tech.market_demand_score,
        type: 'trending'
      }
    end

    all_recommendations = combination_recommendations + beginner_recommendations + trending_recommendations
    all_recommendations.sort_by! { |r| -r[:popularity_score] }
    all_recommendations.uniq! { |r| r[:technology].id }

    render json: {
      recommendations: all_recommendations.take(10).map do |rec|
        {
          id: rec[:technology].id,
          name: rec[:technology].name,
          category: rec[:technology].category,
          description: rec[:technology].description,
          logo_url: rec[:technology].logo_url,
          learning_difficulty: rec[:technology].learning_difficulty,
          market_demand_score: rec[:technology].market_demand_score,
          popularity_score: rec[:technology].popularity_score,
          reason: rec[:reason],
          recommendation_type: rec[:type]
        }
      end
    }
  end

  def learning_path
    company_id = params[:company_id]
    return render json: { error: 'Company ID required' }, status: :bad_request unless company_id

    company = Company.find(company_id)
    company_tech_ids = company.technologies.pluck(:id)
    user_tech_ids = current_user.student_tech_interests.pluck(:technology_id)
    
    # Find gap - technologies company uses that user doesn't have interest in
    gap_tech_ids = company_tech_ids - user_tech_ids
    gap_technologies = Technology.where(id: gap_tech_ids)
    
    # Find overlaps - technologies both have
    overlap_tech_ids = company_tech_ids & user_tech_ids
    overlap_technologies = Technology.where(id: overlap_tech_ids)
    
    # Suggest learning order based on difficulty and dependencies
    learning_order = gap_technologies.sort_by(&:learning_difficulty)

    render json: {
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry
      },
      gap_analysis: {
        total_company_techs: company_tech_ids.size,
        user_matching_techs: overlap_tech_ids.size,
        match_percentage: overlap_tech_ids.size.to_f / company_tech_ids.size * 100,
        technologies_to_learn: gap_technologies.map do |tech|
          {
            id: tech.id,
            name: tech.name,
            category: tech.category,
            learning_difficulty: tech.learning_difficulty,
            market_demand_score: tech.market_demand_score,
            description: tech.description,
            official_url: tech.official_url
          }
        end,
        matching_technologies: overlap_technologies.map do |tech|
          {
            id: tech.id,
            name: tech.name,
            category: tech.category
          }
        end,
        suggested_learning_order: learning_order.map.with_index do |tech, index|
          {
            priority: index + 1,
            id: tech.id,
            name: tech.name,
            category: tech.category,
            learning_difficulty: tech.learning_difficulty,
            estimated_weeks: tech.learning_difficulty * 2,
            prerequisites: tech.related_technologies.select { |rt| gap_tech_ids.include?(rt.id) && rt.learning_difficulty < tech.learning_difficulty }.map { |rt| rt.name }
          }
        end
      }
    }
  end

  private

  def set_student_tech_interest
    @interest = current_user.student_tech_interests.find(params[:id])
  end

  def tech_interest_params
    params.require(:tech_interest).permit(
      :technology_id,
      :skill_level,
      :learning_priority,
      :interest_type
    )
  end

  def format_tech_interest(interest)
    {
      id: interest.id,
      technology: {
        id: interest.technology.id,
        name: interest.technology.name,
        category: interest.technology.category,
        description: interest.technology.description,
        logo_url: interest.technology.logo_url
      },
      skill_level: interest.skill_level,
      skill_level_display: interest.skill_level_display,
      learning_priority: interest.learning_priority,
      interest_type: interest.interest_type,
      interest_type_display: interest.interest_type_display,
      created_at: interest.created_at,
      updated_at: interest.updated_at
    }
  end

  def require_student_user!
    return if current_user.student?
    
    render json: { error: 'Access denied. Student account required.' }, status: :forbidden
  end
end