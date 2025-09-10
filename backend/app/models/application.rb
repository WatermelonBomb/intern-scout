class Application < ApplicationRecord
  belongs_to :student, class_name: 'User'
  belongs_to :job_posting
  has_many :selection_processes, dependent: :destroy

  validates :cover_letter, presence: true
  validates :status, inclusion: { in: %w[pending reviewed accepted rejected] }
  validates :student_id, uniqueness: { scope: :job_posting_id, message: "すでにこの求人に応募しています" }
  
  validate :student_must_be_student_type
  validate :application_deadline_not_passed

  scope :pending, -> { where(status: 'pending') }
  scope :reviewed, -> { where(status: 'reviewed') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :recent, -> { order(applied_at: :desc) }

  def pending?
    status == 'pending'
  end

  def reviewed?
    status == 'reviewed'
  end

  def accepted?
    status == 'accepted'
  end

  def rejected?
    status == 'rejected'
  end

  def mark_as_reviewed!
    transaction do
      update!(status: 'reviewed', reviewed_at: Time.current)
      create_conversation_and_initial_message if status_changed?
    end
  end

  def accept!
    transaction do
      update!(status: 'accepted', reviewed_at: Time.current)
      create_acceptance_message
    end
  end

  def reject!
    transaction do
      update!(status: 'rejected', reviewed_at: Time.current)
      create_rejection_message
    end
  end

  private

  def student_must_be_student_type
    return unless student
    
    unless student.student?
      errors.add(:student, "応募者は学生である必要があります")
    end
  end

  def application_deadline_not_passed
    return unless job_posting&.deadline
    
    if job_posting.deadline < Date.current
      errors.add(:base, "応募締切を過ぎています")
    end
  end

  def create_conversation_and_initial_message
    company = job_posting.company
    conversation = Conversation.find_or_create_between(company, student)
    
    Message.create!(
      sender: company,
      receiver: student,
      conversation: conversation,
      subject: "応募確認のお知らせ - #{job_posting.title}",
      content: "#{student.full_name}様、この度は弊社の求人「#{job_posting.title}」にご応募いただき、ありがとうございます。\n\n応募内容を確認させていただきました。選考に関する詳細につきまして、こちらのメッセージ機能を通じてご連絡させていただきます。\n\nよろしくお願いいたします。"
    )
  end

  def create_acceptance_message
    company = job_posting.company
    conversation = Conversation.find_or_create_between(company, student)
    
    Message.create!(
      sender: company,
      receiver: student,
      conversation: conversation,
      subject: "選考結果のお知らせ（合格） - #{job_posting.title}",
      content: "#{student.full_name}様、この度は弊社の求人「#{job_posting.title}」にご応募いただき、ありがとうございました。\n\n選考の結果、合格とさせていただきました。おめでとうございます！\n\n今後の手続きに関する詳細につきまして、別途ご連絡させていただきます。\n\nよろしくお願いいたします。"
    )
  end

  def create_rejection_message
    company = job_posting.company
    conversation = Conversation.find_or_create_between(company, student)
    
    Message.create!(
      sender: company,
      receiver: student,
      conversation: conversation,
      subject: "選考結果のお知らせ - #{job_posting.title}",
      content: "#{student.full_name}様、この度は弊社の求人「#{job_posting.title}」にご応募いただき、ありがとうございました。\n\n慎重に選考させていただきました結果、今回は残念ながらご希望に添えない結果となりました。\n\n今後とも弊社をよろしくお願いいたします。"
    )
  end
end
