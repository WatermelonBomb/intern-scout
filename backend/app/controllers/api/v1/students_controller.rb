class Api::V1::StudentsController < ApplicationController
  before_action :authorize_company!
  
  # GET /api/v1/students - 学生検索（企業用）
  def index
    Rails.logger.debug "StudentsController#index - params: #{params.inspect}"
    
    filters = {
      major: params[:major],
      preferred_location: params[:preferred_location],
      experience_level: params[:experience_level],
      graduation_year: params[:graduation_year],
      programming_language: params[:programming_language],
      skills: params[:skills]
    }.compact
    
    @students = User.search_students(filters)
                   .includes(:companies)
                   .limit(params[:limit]&.to_i || 50)
                   .offset(params[:offset]&.to_i || 0)
    
    total_count = User.search_students(filters).count
    
    Rails.logger.debug "Found #{@students.count} students matching criteria"
    
    render json: {
      data: @students.map { |student| student_json(student) },
      total_count: total_count,
      filters_applied: filters
    }
  end
  
  # GET /api/v1/students/filter_options - フィルター用のオプション一覧
  def filter_options
    render json: {
      majors: User.students.distinct.pluck(:major).compact.sort,
      preferred_locations: User.students.distinct.pluck(:preferred_location).compact.sort,
      experience_levels: %w[beginner intermediate advanced],
      graduation_years: User.students.distinct.pluck(:graduation_year).compact.sort.reverse,
      programming_languages: get_all_programming_languages
    }
  end
  
  private
  
  def authorize_company!
    unless current_user.company?
      render json: { errors: ['企業ユーザーのみアクセス可能です'] }, status: :forbidden
      return
    end
  end
  
  def student_json(student)
    {
      id: student.id,
      name: student.full_name,
      email: student.email,
      university: student.university,
      major: student.major,
      graduation_year: student.graduation_year,
      preferred_location: student.preferred_location,
      experience_level: student.experience_level,
      programming_languages: student.programming_languages_array,
      skills: student.skills,
      bio: student.bio,
      job_search_status: student.job_search_status
    }
  end
  
  def get_all_programming_languages
    # プログラミング言語の統計を取得
    languages = []
    User.students.where.not(programming_languages: [nil, '']).find_each do |student|
      languages.concat(student.programming_languages_array)
    end
    languages.uniq.sort
  end
end