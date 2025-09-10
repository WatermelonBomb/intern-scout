class SelectionProcess < ApplicationRecord
  belongs_to :application

  validates :process_type, inclusion: { in: %w[coding_test interview document_review presentation other] }
  validates :status, inclusion: { in: %w[assigned in_progress completed overdue] }
  validates :title, presence: true

  scope :assigned, -> { where(status: 'assigned') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :overdue, -> { where(status: 'overdue') }
  scope :pending, -> { where(status: ['assigned', 'in_progress']) }
  scope :due_soon, -> { where('due_date <= ?', 1.day.from_now) }

  def assigned?
    status == 'assigned'
  end

  def in_progress?
    status == 'in_progress'
  end

  def completed?
    status == 'completed'
  end

  def overdue?
    status == 'overdue' || (due_date && due_date < Time.current && !completed?)
  end

  def start!
    update!(status: 'in_progress')
  end

  def complete!
    transaction do
      update!(status: 'completed', completed_at: Time.current)
      notify_completion
    end
  end

  def mark_overdue!
    update!(status: 'overdue') unless completed?
  end

  def self.mark_overdue_processes!
    where('due_date < ? AND status IN (?)', Time.current, ['assigned', 'in_progress'])
      .update_all(status: 'overdue')
  end

  def process_type_display
    case process_type
    when 'coding_test'
      'コーディングテスト'
    when 'interview'
      '面接'
    when 'document_review'
      '書類審査'
    when 'presentation'
      'プレゼンテーション'
    when 'other'
      'その他'
    else
      process_type
    end
  end

  private

  def notify_completion
    company = application.job_posting.company
    student = application.student
    conversation = Conversation.find_or_create_between(company, student)

    Message.create!(
      sender: student,
      receiver: company,
      conversation: conversation,
      subject: "選考プロセス完了のお知らせ - #{title}",
      content: "#{application.job_posting.title}の選考プロセス「#{title}」が完了いたしました。\n\nご確認をお願いいたします。"
    )
  end
end
