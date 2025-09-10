class Api::V1::ScoutTemplatesController < ApplicationController
  before_action :authorize_company!
  before_action :set_scout_template, only: [:show, :update, :destroy, :clone]
  before_action :authorize_template_owner!, only: [:show, :update, :destroy, :clone]
  
  # GET /api/v1/scout_templates
  def index
    @templates = current_user.companies.first&.scout_templates
                             &.active
                             &.recent || ScoutTemplate.none
    
    render json: {
      data: @templates.map { |template| template_json(template) }
    }
  end
  
  # GET /api/v1/scout_templates/:id
  def show
    render json: { data: template_json(@template) }
  end
  
  # POST /api/v1/scout_templates
  def create
    company = current_user.companies.first
    
    unless company
      render json: { errors: ['企業情報が見つかりません'] }, status: :not_found
      return
    end
    
    @template = company.scout_templates.build(template_params)
    
    if @template.save
      render json: { 
        data: template_json(@template), 
        message: 'スカウトテンプレートを作成しました' 
      }, status: :created
    else
      render json: { 
        errors: @template.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end
  
  # PATCH /api/v1/scout_templates/:id
  def update
    if @template.update(template_params)
      render json: { 
        data: template_json(@template), 
        message: 'スカウトテンプレートを更新しました' 
      }
    else
      render json: { 
        errors: @template.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/scout_templates/:id
  def destroy
    # 既に使用されているテンプレートは削除ではなく無効化
    if @template.invitations.exists?
      @template.update(is_active: false)
      render json: { message: 'スカウトテンプレートを無効化しました' }
    else
      @template.destroy
      render json: { message: 'スカウトテンプレートを削除しました' }
    end
  end
  
  # POST /api/v1/scout_templates/:id/clone
  def clone
    company = current_user.companies.first
    
    cloned_template = @template.clone_for_company(company)
    
    if cloned_template.persisted?
      render json: { 
        data: template_json(cloned_template), 
        message: 'テンプレートをコピーしました' 
      }, status: :created
    else
      render json: { 
        errors: cloned_template.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_scout_template
    @template = ScoutTemplate.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['テンプレートが見つかりません'] }, status: :not_found
  end
  
  def authorize_company!
    unless current_user.company?
      render json: { errors: ['企業ユーザーのみアクセス可能です'] }, status: :forbidden
      return
    end
  end
  
  def authorize_template_owner!
    company = current_user.companies.first
    unless company && @template.company == company
      render json: { errors: ['このテンプレートにアクセスする権限がありません'] }, status: :forbidden
    end
  end
  
  def template_params
    params.require(:scout_template).permit(:name, :subject, :message, :is_active)
  end
  
  def template_json(template)
    {
      id: template.id,
      name: template.name,
      subject: template.subject,
      message: template.message,
      is_active: template.is_active,
      usage_count: template.invitations.count,
      created_at: template.created_at,
      updated_at: template.updated_at
    }
  end
end