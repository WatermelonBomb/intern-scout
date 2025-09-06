class User < ApplicationRecord
  has_secure_password
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, :last_name, :user_type, presence: true
  validates :user_type, inclusion: { in: %w[student company] }
  
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id'
  has_many :companies, dependent: :destroy
  has_many :job_postings, through: :companies

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
end
