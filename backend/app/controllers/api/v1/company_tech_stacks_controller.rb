class Api::V1::CompanyTechStacksController < ApplicationController
  before_action :authenticate_user!
  before_action :require_company_user!, except: [:index, :show]
  before_action :set_company
  before_action :set_company_tech_stack, only: [:show, :update, :destroy]

  def index
    @tech_stacks = @company.company_tech_stacks.includes(:technology)
    
    if params[:usage_level].present?
      @tech_stacks = @tech_stacks.where(usage_level: params[:usage_level])
    end
    
    if params[:category].present?
      @tech_stacks = @tech_stacks.joins(:technology)
                                 .where(technologies: { category: params[:category] })
    end

    render json: {
      tech_stacks: @tech_stacks.map do |stack|
        {
          id: stack.id,
          technology: {
            id: stack.technology.id,
            name: stack.technology.name,
            category: stack.technology.category,
            description: stack.technology.description,
            logo_url: stack.technology.logo_url
          },
          usage_level: stack.usage_level,
          usage_level_display: stack.usage_level_display,
          years_used: stack.years_used,
          team_size: stack.team_size,
          project_example: stack.project_example,
          is_main_tech: stack.is_main_tech,
          created_at: stack.created_at,
          updated_at: stack.updated_at
        }
      end,
      tech_stack_summary: {
        main_count: @company.company_tech_stacks.main_technologies.count,
        sub_count: @company.company_tech_stacks.sub_technologies.count,
        experimental_count: @company.company_tech_stacks.experimental_technologies.count,
        by_category: @company.tech_stack_by_category.transform_values(&:count),
        last_updated: @company.tech_stack_last_updated,
        freshness_score: @company.tech_stack_freshness_score
      }
    }
  end

  def show
    render json: {
      tech_stack: {
        id: @tech_stack.id,
        technology: {
          id: @tech_stack.technology.id,
          name: @tech_stack.technology.name,
          category: @tech_stack.technology.category,
          description: @tech_stack.technology.description,
          logo_url: @tech_stack.technology.logo_url,
          official_url: @tech_stack.technology.official_url
        },
        usage_level: @tech_stack.usage_level,
        usage_level_display: @tech_stack.usage_level_display,
        years_used: @tech_stack.years_used,
        team_size: @tech_stack.team_size,
        project_example: @tech_stack.project_example,
        is_main_tech: @tech_stack.is_main_tech,
        created_at: @tech_stack.created_at,
        updated_at: @tech_stack.updated_at
      }
    }
  end

  def create
    @tech_stack = @company.company_tech_stacks.build(tech_stack_params)

    if @tech_stack.save
      @company.update_tech_stack_timestamp!
      render json: {
        message: 'Technology added to stack successfully',
        tech_stack: format_tech_stack(@tech_stack)
      }, status: :created
    else
      render json: {
        errors: @tech_stack.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def bulk_create
    tech_stacks_data = params.require(:tech_stacks)
    
    created_stacks = []
    errors = []

    tech_stacks_data.each_with_index do |stack_data, index|
      tech_stack = @company.company_tech_stacks.build(stack_data.permit(
        :technology_id, :usage_level, :years_used, :team_size, :project_example, :is_main_tech
      ))

      if tech_stack.save
        created_stacks << tech_stack
      else
        errors << {
          index: index,
          technology_id: stack_data[:technology_id],
          errors: tech_stack.errors.full_messages
        }
      end
    end

    if errors.empty?
      @company.update_tech_stack_timestamp!
      render json: {
        message: "Successfully added #{created_stacks.size} technologies to tech stack",
        tech_stacks: created_stacks.map { |stack| format_tech_stack(stack) }
      }, status: :created
    else
      render json: {
        message: "Partially successful: #{created_stacks.size} created, #{errors.size} failed",
        created_stacks: created_stacks.map { |stack| format_tech_stack(stack) },
        errors: errors
      }, status: :unprocessable_entity
    end
  end

  def update
    if @tech_stack.update(tech_stack_params)
      @company.update_tech_stack_timestamp!
      render json: {
        message: 'Technology stack updated successfully',
        tech_stack: format_tech_stack(@tech_stack)
      }
    else
      render json: {
        errors: @tech_stack.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @tech_stack.destroy
    @company.update_tech_stack_timestamp!
    render json: {
      message: 'Technology removed from stack successfully'
    }
  end

  def suggestions
    # Get suggestions based on company industry and existing tech stack
    existing_tech_ids = @company.technologies.pluck(:id)
    
    # Find similar companies in the same industry
    similar_companies = Company.where(industry: @company.industry)
                               .where.not(id: @company.id)
                               .joins(:company_tech_stacks)
                               .group('companies.id')
                               .having('COUNT(company_tech_stacks.id) > 0')
                               .limit(10)

    # Get popular technologies from similar companies
    suggested_tech_ids = CompanyTechStack.joins(:company)
                                        .where(companies: { industry: @company.industry })
                                        .where.not(technology_id: existing_tech_ids)
                                        .group(:technology_id)
                                        .order('COUNT(*) DESC')
                                        .limit(10)
                                        .pluck(:technology_id)

    suggested_technologies = Technology.where(id: suggested_tech_ids)

    # Also suggest based on tech combinations
    combination_suggestions = []
    existing_tech_ids.each do |tech_id|
      combinations = TechCombination.find_combinations_for_tech(tech_id)
      combinations.each do |combo|
        other_tech = combo.primary_tech_id == tech_id ? combo.secondary_tech : combo.primary_tech
        unless existing_tech_ids.include?(other_tech.id)
          combination_suggestions << {
            technology: other_tech,
            reason: "Often used with #{Technology.find(tech_id).name}",
            popularity_score: combo.popularity_score
          }
        end
      end
    end

    render json: {
      industry_suggestions: suggested_technologies.map do |tech|
        {
          id: tech.id,
          name: tech.name,
          category: tech.category,
          description: tech.description,
          popularity_score: tech.popularity_score,
          reason: "Popular in #{@company.industry} industry"
        }
      end,
      combination_suggestions: combination_suggestions.sort_by { |s| -s[:popularity_score] }.take(5).map do |suggestion|
        {
          id: suggestion[:technology].id,
          name: suggestion[:technology].name,
          category: suggestion[:technology].category,
          description: suggestion[:technology].description,
          reason: suggestion[:reason],
          popularity_score: suggestion[:popularity_score]
        }
      end
    }
  end

  private

  def set_company
    if current_user.company?
      @company = current_user.company
    else
      @company = Company.find(params[:company_id])
    end
  end

  def set_company_tech_stack
    @tech_stack = @company.company_tech_stacks.find(params[:id])
  end

  def tech_stack_params
    params.require(:tech_stack).permit(
      :technology_id,
      :usage_level,
      :years_used,
      :team_size,
      :project_example,
      :is_main_tech
    )
  end

  def format_tech_stack(tech_stack)
    {
      id: tech_stack.id,
      technology: {
        id: tech_stack.technology.id,
        name: tech_stack.technology.name,
        category: tech_stack.technology.category
      },
      usage_level: tech_stack.usage_level,
      years_used: tech_stack.years_used,
      team_size: tech_stack.team_size,
      project_example: tech_stack.project_example,
      is_main_tech: tech_stack.is_main_tech
    }
  end

  def require_company_user!
    return if current_user.company?
    
    render json: { error: 'Access denied. Company account required.' }, status: :forbidden
  end
end