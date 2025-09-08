class Invitation < ApplicationRecord
  belongs_to :company, class_name: 'User'
  belongs_to :student, class_name: 'User'
  belongs_to :job_posting

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
