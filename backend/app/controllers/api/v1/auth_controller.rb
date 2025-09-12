class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:signup, :login]

  def signup
    user = User.new(user_params)
    
    if user.save
      # Create company profile if user is a company
      if user.company?
        company = user.companies.create!(
          name: params[:company_name],
          industry: params[:industry],
          description: params[:company_description],
          website: params[:website],
          location: params[:location]
        )
      end
      
      token = JsonWebToken.encode(user_id: user.id)
      
      # Set httpOnly cookie for secure authentication
      response.set_cookie(:auth_token, {
        value: token,
        expires: 1.week.from_now,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax,
        path: '/'
      })
      
      render json: { 
        user: user_response(user),
        company: (company ? company_response(company) : nil)
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  rescue => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def login
    user = User.find_by(email: params[:email])
    
    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      company = user.companies.first if user.company?
      
      # Set httpOnly cookie for secure authentication  
      response.set_cookie(:auth_token, {
        value: token,
        expires: 1.week.from_now,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax,
        path: '/'
      })
      
      Rails.logger.info "Setting auth_token cookie in login: #{token[0..10]}..."
      
      render json: { 
        user: user_response(user),
        company: (company ? company_response(company) : nil)
      }
    else
      render json: { errors: ['Invalid email or password'] }, status: :unauthorized
    end
  end

  def logout
    # Clear the httpOnly cookie
    response.delete_cookie(:auth_token, path: '/')
    render json: { message: 'Logged out successfully' }
  end

  def me
    company = current_user.companies.first if current_user.company?
    render json: { 
      user: user_response(current_user),
      company: (company ? company_response(company) : nil)
    }
  end

  private

  def user_params
    params.permit(:email, :password, :password_confirmation, :first_name, :last_name, 
                  :user_type, :university, :graduation_year, :bio, :skills,
                  :company_name, :industry, :company_description, :website, :location)
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
