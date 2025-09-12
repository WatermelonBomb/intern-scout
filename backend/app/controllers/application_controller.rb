class ApplicationController < ActionController::API
  include ActionController::Cookies
  before_action :authenticate_request
  
  private
  
  def authenticate_request
    # Try to get token from httpOnly cookie first, then fall back to Authorization header
    token = request.cookies['auth_token']
    
    # Fallback to Authorization header for backward compatibility during migration
    if token.nil?
      header = request.headers['Authorization']
      token = header.split(' ').last if header
    end
    
    # If no token is provided, return unauthorized
    if token.nil?
      render json: { errors: 'No authentication token provided' }, status: :unauthorized
      return
    end
    
    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound => e
      render json: { errors: 'User not found' }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { errors: 'Invalid token' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
  
  def authenticate_company!
    render json: { errors: 'Not authorized as company' }, status: :forbidden unless current_user&.company?
  end
  
  def authenticate_student!
    render json: { errors: 'Not authorized as student' }, status: :forbidden unless current_user&.student?
  end
end
