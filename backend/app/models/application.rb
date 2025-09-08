class Application < ApplicationRecord
  belongs_to :student, class_name: 'User'
  belongs_to :job_posting

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
    update!(status: 'reviewed', reviewed_at: Time.current)
  end

  def accept!
    update!(status: 'accepted', reviewed_at: Time.current)
  end

  def reject!
    update!(status: 'rejected', reviewed_at: Time.current)
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
end
