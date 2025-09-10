class Invitation < ApplicationRecord
  belongs_to :company, class_name: 'User'
  belongs_to :student, class_name: 'User'
  belongs_to :job_posting
  belongs_to :scout_template, optional: true

  validates :message, presence: true
  validates :status, inclusion: { in: %w[sent accepted rejected expired] }
  validates :company_id, uniqueness: { 
    scope: [:student_id, :job_posting_id], 
    message: "この学生に対してこの求人のスカウトを既に送信しています" 
  }

  validate :company_must_be_company_type
  validate :student_must_be_student_type
  validate :job_posting_belongs_to_company

  scope :sent, -> { where(status: 'sent') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :expired, -> { where(status: 'expired') }
  scope :recent, -> { order(sent_at: :desc) }
  scope :pending, -> { where(status: 'sent') }
  scope :bulk_sent, -> { where(is_bulk_sent: true) }
  scope :individual_sent, -> { where(is_bulk_sent: false) }
  scope :by_campaign, ->(campaign_id) { where(campaign_id: campaign_id) }

  # Auto-expire invitations after 30 days
  scope :expired_invitations, -> { where(status: 'sent').where('sent_at < ?', 30.days.ago) }

  def sent?
    status == 'sent'
  end

  def accepted?
    status == 'accepted'
  end

  def rejected?
    status == 'rejected'
  end

  def expired?
    status == 'expired'
  end

  def accept!
    transaction do
      update!(status: 'accepted', responded_at: Time.current)
      create_conversation_and_initial_message
    end
  end

  def reject!
    update!(status: 'rejected', responded_at: Time.current)
  end

  def expire!
    update!(status: 'expired')
  end

  def self.expire_old_invitations!
    expired_invitations.update_all(status: 'expired')
  end
  
  # 一括スカウト送信用のクラスメソッド
  def self.bulk_scout_students(company:, students:, job_posting:, message:, scout_template: nil)
    campaign_id = SecureRandom.uuid
    
    transaction do
      invitations = []
      
      students.each do |student|
        # 既に同じ学生・求人の組み合わせでスカウトが存在しないかチェック
        next if exists?(company_id: company.id, student_id: student.id, job_posting_id: job_posting.id)
        
        invitation = new(
          company: company,
          student: student,
          job_posting: job_posting,
          message: message,
          scout_template: scout_template,
          campaign_id: campaign_id,
          is_bulk_sent: true,
          sent_at: Time.current
        )
        
        if invitation.valid?
          invitations << invitation
        end
      end
      
      # バルクインサート
      Invitation.import(invitations, validate: false) if invitations.any?
      
      {
        campaign_id: campaign_id,
        sent_count: invitations.count,
        total_students: students.count
      }
    end
  end

  private

  def company_must_be_company_type
    return unless company
    
    unless company.company?
      errors.add(:company, "スカウトの送信者は企業である必要があります")
    end
  end

  def student_must_be_student_type
    return unless student
    
    unless student.student?
      errors.add(:student, "スカウトの受信者は学生である必要があります")
    end
  end

  def job_posting_belongs_to_company
    return unless company && job_posting
    
    unless job_posting.company == company
      errors.add(:job_posting, "この求人は指定された企業の求人ではありません")
    end
  end

  def create_conversation_and_initial_message
    conversation = Conversation.find_or_create_between(company, student)
    
    Message.create!(
      sender: company,
      receiver: student,
      conversation: conversation,
      subject: "スカウト承諾のお知らせ - #{job_posting.title}",
      content: "#{student.name}様、この度は弊社の求人「#{job_posting.title}」へのスカウトをご承諾いただき、ありがとうございます。\n\n選考に関する詳細につきまして、こちらのメッセージ機能を通じてご連絡させていただきます。\n\nよろしくお願いいたします。"
    )
  end
end
