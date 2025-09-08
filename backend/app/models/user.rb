class User < ApplicationRecord
  has_secure_password
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, :last_name, :user_type, presence: true
  validates :user_type, inclusion: { in: %w[student company] }
  
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id'
  has_many :companies, dependent: :destroy
  has_many :job_postings, through: :companies
  
  # Student applications
  has_many :applications, foreign_key: 'student_id', dependent: :destroy
  has_many :applied_job_postings, through: :applications, source: :job_posting
  
  has_many :user1_conversations, class_name: 'Conversation', foreign_key: 'user1_id'
  has_many :user2_conversations, class_name: 'Conversation', foreign_key: 'user2_id'

  scope :students, -> { where(user_type: 'student') }
  scope :companies, -> { where(user_type: 'company') }
  
  def full_name
    "#{first_name} #{last_name}"
  end
  
  def student?
    user_type == 'student'
  end
  
  def company?
    user_type == 'company'
  end

  def conversations
    Conversation.for_user(self).recent
  end

  def conversation_with(other_user)
    Conversation.between(self, other_user)
  end
end
