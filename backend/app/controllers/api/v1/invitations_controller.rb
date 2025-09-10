class Api::V1::InvitationsController < ApplicationController
  before_action :set_invitation, only: [:show, :destroy, :accept, :reject]

  # GET /api/v1/invitations - 受信したスカウト一覧（学生用）
  # GET /api/v1/invitations?sent=true - 送信したスカウト一覧（企業用）
  def index
    Rails.logger.debug "InvitationsController#index - params: #{params.inspect}"
    Rails.logger.debug "InvitationsController#index - current_user: #{current_user.inspect}"
    
    if params[:sent] == 'true'
      # 企業が送信したスカウト一覧
      Rails.logger.debug "Loading sent invitations for company"
      authorize_company!
      return if performed?
      @invitations = current_user.sent_invitations
        .includes(:student, :job_posting)
        .recent
    else
      # 学生が受信したスカウト一覧
      Rails.logger.debug "Loading received invitations for student"
      authorize_student!
      return if performed?
      @invitations = current_user.received_invitations
        .includes(:company, :job_posting)
        .recent
    end

    if params[:status].present?
      @invitations = @invitations.where(status: params[:status])
    end

    Rails.logger.debug "Found #{@invitations.count} invitations"
    
    render json: {
      data: @invitations.map { |invitation| invitation_json(invitation) }
    }
  end

  # GET /api/v1/invitations/:id
  def show
    render json: { data: invitation_json(@invitation) }
  end

  # POST /api/v1/invitations - スカウト送信（企業用）
  def create
    authorize_company!
    
    @invitation = current_user.sent_invitations.build(invitation_params)
    @invitation.sent_at = Time.current

    if @invitation.save
      render json: { 
        data: invitation_json(@invitation), 
        message: 'スカウトを送信しました' 
      }, status: :created
    else
      render json: { 
        errors: @invitation.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v1/invitations/bulk - 一括スカウト送信（企業用）
  def bulk_create
    authorize_company!
    
    student_ids = params[:student_ids] || []
    job_posting_id = params[:job_posting_id]
    message = params[:message]
    scout_template_id = params[:scout_template_id]
    
    # バリデーション
    if student_ids.empty?
      render json: { errors: ['送信先の学生が選択されていません'] }, status: :unprocessable_entity
      return
    end
    
    job_posting = current_user.job_postings.find_by(id: job_posting_id)
    unless job_posting
      render json: { errors: ['求人が見つかりません'] }, status: :not_found
      return
    end
    
    if message.blank?
      render json: { errors: ['メッセージが入力されていません'] }, status: :unprocessable_entity
      return
    end
    
    # 学生を取得
    students = User.students.where(id: student_ids)
    
    # スカウトテンプレートを取得（任意）
    scout_template = nil
    if scout_template_id.present?
      company = current_user.companies.first
      scout_template = company&.scout_templates&.find_by(id: scout_template_id)
    end
    
    # 一括送信実行
    begin
      result = Invitation.bulk_scout_students(
        company: current_user,
        students: students,
        job_posting: job_posting,
        message: message,
        scout_template: scout_template
      )
      
      render json: { 
        data: result,
        message: "#{result[:sent_count]}件のスカウトを送信しました（対象学生数: #{result[:total_students]}件）"
      }, status: :created
      
    rescue => e
      Rails.logger.error "Bulk scout error: #{e.message}"
      render json: { 
        errors: ['一括スカウト送信中にエラーが発生しました'] 
      }, status: :internal_server_error
    end
  end

  # PATCH /api/v1/invitations/:id/accept - スカウト承諾（学生用）
  def accept
    authorize_student!
    authorize_invitation_recipient!

    if @invitation.accept!
      render json: { 
        data: invitation_json(@invitation), 
        message: 'スカウトを承諾しました。メッセージ機能でやり取りを開始してください。' 
      }
    else
      render json: { 
        errors: @invitation.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/invitations/:id/reject - スカウト拒否（学生用）
  def reject
    authorize_student!
    authorize_invitation_recipient!

    if @invitation.reject!
      render json: { 
        data: invitation_json(@invitation), 
        message: 'スカウトを辞退しました' 
      }
    else
      render json: { 
        errors: @invitation.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/invitations/:id - スカウト削除（企業用）
  def destroy
    authorize_company!
    authorize_invitation_sender!

    if @invitation.sent?
      @invitation.destroy
      render json: { message: 'スカウトを取り消しました' }
    else
      render json: { 
        errors: ['既に返答済みのスカウトは削除できません'] 
      }, status: :unprocessable_entity
    end
  end

  private

  def set_invitation
    @invitation = Invitation.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['スカウトが見つかりません'] }, status: :not_found
  end

  def invitation_params
    params.require(:invitation).permit(:student_id, :job_posting_id, :message)
  end

  def authorize_company!
    unless current_user.company?
      render json: { errors: ['企業ユーザーのみアクセス可能です'] }, status: :forbidden
      return
    end
  end

  def authorize_student!
    unless current_user.student?
      render json: { errors: ['学生ユーザーのみアクセス可能です'] }, status: :forbidden
      return
    end
  end

  def authorize_invitation_sender!
    unless @invitation.company == current_user
      render json: { errors: ['このスカウトにアクセスする権限がありません'] }, status: :forbidden
      return
    end
  end

  def authorize_invitation_recipient!
    unless @invitation.student == current_user
      render json: { errors: ['このスカウトにアクセスする権限がありません'] }, status: :forbidden
      return
    end
  end

  def invitation_json(invitation)
    {
      id: invitation.id,
      message: invitation.message,
      status: invitation.status,
      sent_at: invitation.sent_at,
      responded_at: invitation.responded_at,
      company: {
        id: invitation.company.id,
        name: invitation.company.full_name
      },
      student: {
        id: invitation.student.id,
        name: invitation.student.full_name
      },
      job_posting: {
        id: invitation.job_posting.id,
        title: invitation.job_posting.title,
        employment_type: invitation.job_posting.employment_type
      }
    }
  end
end
