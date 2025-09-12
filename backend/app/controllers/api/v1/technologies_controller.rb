class Api::V1::TechnologiesController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :show, :trending] # Temporarily for testing
  before_action :set_technology, only: [:show]

  def index
    @technologies = Technology.all
    
    if params[:category].present?
      @technologies = @technologies.by_category(params[:category])
    end
    
    if params[:search].present?
      @technologies = @technologies.where('name ILIKE ?', "%#{params[:search]}%")
    end
    
    case params[:sort]
    when 'popular'
      @technologies = @technologies.popular
    when 'in_demand' 
      @technologies = @technologies.in_demand
    when 'name'
      @technologies = @technologies.order(:name)
    else
      @technologies = @technologies.popular
    end
    
    @technologies = @technologies.limit(params[:limit]) if params[:limit].present?
    
    render json: {
      technologies: @technologies.map do |tech|
        {
          id: tech.id,
          name: tech.name,
          category: tech.category,
          description: tech.description,
          official_url: tech.official_url,
          logo_url: tech.logo_url,
          learning_difficulty: tech.learning_difficulty,
          market_demand_score: tech.market_demand_score,
          popularity_score: tech.popularity_score,
          companies_using_count: tech.companies_using_count,
          interested_students_count: tech.interested_students_count
        }
      end,
      total_count: Technology.count,
      categories: Technology::CATEGORIES
    }
  end

  def show
    render json: {
      technology: {
        id: @technology.id,
        name: @technology.name,
        category: @technology.category,
        description: @technology.description,
        official_url: @technology.official_url,
        logo_url: @technology.logo_url,
        learning_difficulty: @technology.learning_difficulty,
        market_demand_score: @technology.market_demand_score,
        popularity_score: @technology.popularity_score,
        companies_using_count: @technology.companies_using_count,
        interested_students_count: @technology.interested_students_count,
        related_technologies: @technology.related_technologies.map do |related|
          {
            id: related.id,
            name: related.name,
            category: related.category
          }
        end
      }
    }
  end

  def trending
    trending_techs = Technology.joins(:company_tech_stacks)
                              .group('technologies.id')
                              .order('COUNT(company_tech_stacks.id) DESC')
                              .limit(10)

    render json: {
      trending_technologies: trending_techs.map do |tech|
        {
          id: tech.id,
          name: tech.name,
          category: tech.category,
          companies_using_count: tech.companies_using_count,
          popularity_score: tech.popularity_score
        }
      end
    }
  end

  def combinations
    tech_id = params[:tech_id]
    combinations = TechCombination.find_combinations_for_tech(tech_id)
    
    render json: {
      combinations: combinations.map do |combo|
        other_tech = combo.primary_tech_id == tech_id.to_i ? combo.secondary_tech : combo.primary_tech
        {
          id: other_tech.id,
          name: other_tech.name,
          category: other_tech.category,
          combination_type: combo.combination_type,
          popularity_score: combo.popularity_score
        }
      end
    }
  end

  private

  def set_technology
    @technology = Technology.find(params[:id])
  end
end