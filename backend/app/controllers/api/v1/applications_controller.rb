class Api::V1::ApplicationsController < ApplicationController
  before_action :set_application, only: [:show, :update, :destroy]
  before_action :set_job_posting, only: [:create]
  before_action :authenticate_student!, only: [:create]

  def index
    if current_user.student?
      # 学生は自分の応募履歴のみ表示
      applications = current_user.applications
                                 .includes(job_posting: { company: :user })
                                 .recent
    elsif current_user.company?
      # 企業は自社の求人への応募を表示
      company = current_user.companies.first
      return render json: { errors: ['Company profile not found'] }, status: :unprocessable_entity unless company
      
      applications = Application.joins(job_posting: :company)
                                .where(job_postings: { company: company })
                                .includes(:student, job_posting: { company: :user })
                                .recent
    else
      return render json: { errors: ['Invalid user type'] }, status: :forbidden
    end

    render json: applications.map { |app| application_response(app) }
  end

  def show
    unless can_access_application?(@application)
      return render json: { errors: ['Not authorized'] }, status: :forbidden
    end

    render json: application_response(@application)
  end

  def create
    unless @job_posting.active?
      return render json: { errors: ['この求人の応募期限が過ぎています'] }, status: :unprocessable_entity
    end

    if @job_posting.has_application_from?(current_user)
      return render json: { errors: ['すでにこの求人に応募しています'] }, status: :unprocessable_entity
    end

    application = @job_posting.applications.build(application_params)
    application.student = current_user
    application.applied_at = Time.current

    if application.save
      render json: application_response(application), status: :created
    else
      render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    unless can_manage_application?(@application)
      return render json: { errors: ['Not authorized'] }, status: :forbidden
    end

    if @application.update(status_params)
      @application.update!(reviewed_at: Time.current) unless @application.pending?
      render json: application_response(@application)
    else
      render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    unless can_delete_application?(@application)
      return render json: { errors: ['Not authorized'] }, status: :forbidden
    end

    @application.destroy
    render json: { message: 'Application withdrawn successfully' }
  end

  private

  def set_application
    @application = Application.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Application not found'] }, status: :not_found
  end

  def set_job_posting
    @job_posting = JobPosting.find(params[:job_posting_id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Job posting not found'] }, status: :not_found
  end

  def application_params
    params.permit(:cover_letter)
  end

  def status_params
    params.permit(:status)
  end

  def can_access_application?(application)
    return true if current_user == application.student
    return true if current_user.company? && 
                  current_user.companies.joins(:job_postings)
                              .exists?(job_postings: { id: application.job_posting_id })
    false
  end

  def can_manage_application?(application)
    return false unless current_user.company?
    current_user.companies.joins(:job_postings)
                .exists?(job_postings: { id: application.job_posting_id })
  end

  def can_delete_application?(application)
    # 学生は応募を取り下げできる（pendingの場合のみ）
    return application.pending? if current_user == application.student
    false
  end

  def application_response(application)
    {
      id: application.id,
      cover_letter: application.cover_letter,
      status: application.status,
      applied_at: application.applied_at,
      reviewed_at: application.reviewed_at,
      student: {
        id: application.student.id,
        full_name: application.student.full_name,
        email: application.student.email,
        university: application.student.university,
        graduation_year: application.student.graduation_year,
        bio: application.student.bio,
        skills: application.student.skills
      },
      job_posting: {
        id: application.job_posting.id,
        title: application.job_posting.title,
        company: {
          id: application.job_posting.company.id,
          name: application.job_posting.company.name
        }
      }
    }
  end
end