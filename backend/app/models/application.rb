class Application < ApplicationRecord
  belongs_to :student, class_name: 'User'
  belongs_to :job_posting
  has_many :selection_processes, dependent: :destroy

  validates :cover_letter, presence: true
  validates :status, inclusion: { in: %w[pending reviewed accepted rejected] }
  validates :student_id, uniqueness: { scope: :job_posting_id, message: "すでにこの求人に応募しています" }
  
  validate :student_must_be_student_type
  validate :application_deadline_not_passed

  after_commit :send_initial_notifications, on: :create

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
      send_review_update_message if saved_change_to_status?
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

  def send_review_update_message
    company_message_sender = company_user
    return unless company_message_sender

    conversation = Conversation.find_or_create_between(company_message_sender, student)

    Message.create!(
      sender: company_message_sender,
      receiver: student,
      conversation: conversation,
      subject: "応募内容確認のお知らせ - #{job_posting.title}",
      content: "#{student.full_name}様、求人「#{job_posting.title}」へのご応募ありがとうございます。\n\n応募内容を確認いたしました。引き続き選考を進めてまいりますので、今後のご連絡をお待ちください。\n\nご不明点がございましたら、このスレッドよりお気軽にお問い合わせください。"
    )
  end

  def create_acceptance_message
    company_message_sender = company_user
    return unless company_message_sender

    conversation = Conversation.find_or_create_between(company_message_sender, student)

    Message.create!(
      sender: company_message_sender,
      receiver: student,
      conversation: conversation,
      subject: "選考結果のお知らせ（合格） - #{job_posting.title}",
      content: "#{student.full_name}様、この度は弊社の求人「#{job_posting.title}」にご応募いただき、ありがとうございました。\n\n選考の結果、合格とさせていただきました。おめでとうございます！\n\n今後の手続きに関する詳細につきまして、別途ご連絡させていただきます。\n\nよろしくお願いいたします。"
    )
  end

  def create_rejection_message
    company_message_sender = company_user
    return unless company_message_sender

    conversation = Conversation.find_or_create_between(company_message_sender, student)

    Message.create!(
      sender: company_message_sender,
      receiver: student,
      conversation: conversation,
      subject: "選考結果のお知らせ - #{job_posting.title}",
      content: "#{student.full_name}様、この度は弊社の求人「#{job_posting.title}」にご応募いただき、ありがとうございました。\n\n慎重に選考させていただきました結果、今回は残念ながらご希望に添えない結果となりました。\n\n今後とも弊社をよろしくお願いいたします。"
    )
  end

  def send_student_submission_acknowledgement
    company_message_sender = company_user
    return unless company_message_sender

    conversation = Conversation.find_or_create_between(company_message_sender, student)

    Message.create!(
      sender: company_message_sender,
      receiver: student,
      conversation: conversation,
      subject: "応募を受け付けました - #{job_posting.title}",
      content: "#{student.full_name}様、この度は求人「#{job_posting.title}」へご応募いただき、ありがとうございます。\n\n応募内容をただいま社内で確認しております。進捗があり次第、こちらのメッセージよりご連絡いたしますので、今しばらくお待ちください。\n\nどうぞよろしくお願いいたします。"
    )
  end

  def notify_company_of_submission
    company_message_receiver = company_user
    return unless company_message_receiver

    conversation = Conversation.find_or_create_between(company_message_receiver, student)

    Message.create!(
      sender: student,
      receiver: company_message_receiver,
      conversation: conversation,
      subject: "新しい応募が届きました - #{job_posting.title}",
      content: "#{company_message_receiver.full_name}様\n\n#{student.full_name}様より求人「#{job_posting.title}」への応募が届きました。\n応募管理ページまたはこのスレッドから内容をご確認ください。\n\n対応が必要な場合は、こちらの会話から学生へ直接ご連絡いただけます。"
    )
  end

  def send_initial_notifications
    notify_company_of_submission
  rescue => e
    Rails.logger.error("Application##{id} company notification error: #{e.class} - #{e.message}")
  ensure
    begin
      send_student_submission_acknowledgement
    rescue => ack_error
      Rails.logger.error("Application##{id} student acknowledgement error: #{ack_error.class} - #{ack_error.message}")
    end
  end

  def company_user
    job_posting.company&.user
  end
end
