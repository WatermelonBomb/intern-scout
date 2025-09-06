class Api::V1::UsersController < ApplicationController
  before_action :set_user, only: [:show, :update]

  def index
    users = User.students.includes(:companies)
    render json: users.map { |user| user_response(user) }
  end

  def show
    render json: user_response(@user)
  end
  
  def search
    students = User.students
    
    # Filter by skills if provided
    if params[:skills].present?
      skills_query = params[:skills].split(',').map(&:strip)
      students = students.where("skills ILIKE ANY (ARRAY[?])", skills_query.map { |skill| "%#{skill}%" })
    end
    
    # Filter by university if provided
    if params[:university].present?
      students = students.where("university ILIKE ?", "%#{params[:university]}%")
    end
    
    # Filter by graduation year if provided
    if params[:graduation_year].present?
      students = students.where(graduation_year: params[:graduation_year])
    end
    
    render json: students.map { |user| user_response(user) }
  end

  def update
    if @user == current_user
      if @user.update(user_params)
        # Update company if user is a company
        if @user.company? && company_params.present?
          company = @user.companies.first_or_create
          company.update(company_params)
        end
        
        render json: { 
          user: user_response(@user),
          company: (@user.company? ? company_response(@user.companies.first) : nil)
        }
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { errors: ['Not authorized'] }, status: :forbidden
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['User not found'] }, status: :not_found
  end

  def user_params
    params.permit(:first_name, :last_name, :university, :graduation_year, :bio, :skills)
  end
  
  def company_params
    params.permit(:name, :industry, :description, :website, :location)
  end
  
  def user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      user_type: user.user_type,
      university: user.university,
      graduation_year: user.graduation_year,
      bio: user.bio,
      skills: user.skills
    }
  end
  
  def company_response(company)
    return nil unless company
    
    {
      id: company.id,
      name: company.name,
      industry: company.industry,
      description: company.description,
      website: company.website,
      location: company.location
    }
  end
end
