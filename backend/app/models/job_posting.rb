class JobPosting < ApplicationRecord
  belongs_to :company
  has_many :applications, dependent: :destroy
  has_many :applicants, through: :applications, source: :student
  
  validates :title, :description, presence: true
  validates :employment_type, inclusion: { in: %w[internship part_time full_time contract] }
  
  scope :active, -> { where('deadline IS NULL OR deadline > ?', Date.current) }
  scope :expired, -> { where('deadline <= ?', Date.current) }
  
  def active?
    deadline.nil? || deadline > Date.current
  end
  
  def expired?
    !active?
  end

  def applications_count
    applications.count
  end

  def pending_applications_count
    applications.pending.count
  end

  def has_application_from?(user)
    return false unless user&.student?
    applications.exists?(student: user)
  end

  def application_from(user)
    return nil unless user&.student?
    applications.find_by(student: user)
  end
end
