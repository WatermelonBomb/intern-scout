class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  
  validates :subject, :content, presence: true
  
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  
  def read?
    read_at.present?
  end
  
  def mark_as_read!
    update(read_at: Time.current)
  end
end
