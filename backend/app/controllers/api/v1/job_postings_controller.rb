class Api::V1::JobPostingsController < ApplicationController
  before_action :set_job_posting, only: [:show, :update, :destroy]
  before_action :authenticate_company!, only: [:create, :update, :destroy]

  def index
    job_postings = JobPosting.active.includes(company: :user)
    render json: job_postings.map { |job| job_posting_response(job) }
  end

  def show
    render json: job_posting_response(@job_posting)
  end

  def create
    company = current_user.companies.first
    unless company
      render json: { errors: ['Company profile not found'] }, status: :unprocessable_entity
      return
    end
    
    # Map salary to salary_range and application_deadline to deadline
    job_params = job_posting_params
    job_params[:salary_range] = params[:salary] if params[:salary].present?
    job_params[:deadline] = params[:application_deadline] if params[:application_deadline].present?
    
    job_posting = company.job_postings.build(job_params)
    
    if job_posting.save
      render json: job_posting_response(job_posting), status: :created
    else
      render json: { errors: job_posting.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    unless @job_posting.company.user == current_user
      render json: { errors: ['Not authorized'] }, status: :forbidden
      return
    end
    
    if @job_posting.update(job_posting_params)
      render json: job_posting_response(@job_posting)
    else
      render json: { errors: @job_posting.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    unless @job_posting.company.user == current_user
      render json: { errors: ['Not authorized'] }, status: :forbidden
      return
    end
    
    @job_posting.destroy
    render json: { message: 'Job posting deleted successfully' }
  end

  private

  def set_job_posting
    @job_posting = JobPosting.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Job posting not found'] }, status: :not_found
  end

  def job_posting_params
    params.permit(:title, :description, :requirements, :location, :salary_range, :employment_type, :deadline, :salary, :application_deadline)
  end
  
  def job_posting_response(job_posting)
    {
      id: job_posting.id,
      title: job_posting.title,
      description: job_posting.description,
      requirements: job_posting.requirements,
      location: job_posting.location,
      salary_range: job_posting.salary_range,
      employment_type: job_posting.employment_type,
      deadline: job_posting.deadline,
      active: job_posting.active?,
      created_at: job_posting.created_at,
      company: {
        id: job_posting.company.id,
        name: job_posting.company.name,
        industry: job_posting.company.industry,
        location: job_posting.company.location,
        website: job_posting.company.website
      }
    }
  end
end
