class JobPosting < ApplicationRecord
  belongs_to :company
  
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
end
