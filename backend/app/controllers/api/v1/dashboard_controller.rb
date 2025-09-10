class Api::V1::DashboardController < ApplicationController

  def stats
    case current_user.user_type
    when 'student'
      render json: student_stats
    when 'company'
      render json: company_stats
    else
      render json: { error: 'Invalid user type' }, status: :bad_request
    end
  end

  private

  def student_stats
    {
      received_messages: current_user.received_messages.count,
      unread_messages: current_user.received_messages.where(read_at: nil).count,
      available_jobs: JobPosting.count,
      conversations: current_user.conversations.count
    }
  end

  def company_stats
    company = current_user.companies.first
    return { error: 'Company profile not found' } unless company

    # Get applications for company's job postings
    applications = Application.joins(job_posting: :company)
                             .where(job_postings: { company: company })

    {
      posted_jobs: company.job_postings.count,
      active_jobs: company.job_postings.active.count,
      sent_messages: current_user.sent_messages.count,
      conversations: current_user.conversations.count,
      total_applications: applications.count,
      new_applications: applications.pending.count,
      reviewed_applications: applications.reviewed.count,
      accepted_applications: applications.accepted.count
    }
  end
end