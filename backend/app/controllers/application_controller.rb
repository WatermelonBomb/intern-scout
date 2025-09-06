class ApplicationController < ActionController::API
  before_action :authenticate_request
  
  private
  
  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      decoded = JsonWebToken.decode(header)
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
