class Api::V1::InvitationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_invitation, only: [:show, :update, :destroy, :accept, :reject]

  # GET /api/v1/invitations - 受信したスカウト一覧（学生用）
  # GET /api/v1/invitations?sent=true - 送信したスカウト一覧（企業用）
  def index
    if params[:sent] == 'true'
      # 企業が送信したスカウト一覧
      authorize_company!
      @invitations = current_user.sent_invitations
        .includes(:student, :job_posting)
        .recent
    else
      # 学生が受信したスカウト一覧
      authorize_student!
      @invitations = current_user.received_invitations
        .includes(:company, :job_posting)
        .recent
    end

    if params[:status].present?
      @invitations = @invitations.where(status: params[:status])
    end

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
    end
  end

  def authorize_student!
    unless current_user.student?
      render json: { errors: ['学生ユーザーのみアクセス可能です'] }, status: :forbidden
    end
  end

  def authorize_invitation_sender!
    unless @invitation.company == current_user
      render json: { errors: ['このスカウトにアクセスする権限がありません'] }, status: :forbidden
    end
  end

  def authorize_invitation_recipient!
    unless @invitation.student == current_user
      render json: { errors: ['このスカウトにアクセスする権限がありません'] }, status: :forbidden
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
