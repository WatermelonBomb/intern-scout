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
      unread_messages: current_user.received_messages.where(read: false).count,
      available_jobs: JobPosting.where(active: true).count,
      conversations: current_user.conversations.count
    }
  end

  def company_stats
    company = current_user.companies.first
    return { error: 'Company profile not found' } unless company

    {
      posted_jobs: company.job_postings.count,
      active_jobs: company.job_postings.where(active: true).count,
      sent_messages: current_user.sent_messages.count,
      conversations: current_user.conversations.count
    }
  end
end