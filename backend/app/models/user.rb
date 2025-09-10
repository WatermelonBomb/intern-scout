class User < ApplicationRecord
  has_secure_password
  
  validates :email, presence: true, uniqueness: true
  validates :first_name, :last_name, :user_type, presence: true
  validates :user_type, inclusion: { in: %w[student company] }
  validates :experience_level, inclusion: { in: %w[beginner intermediate advanced] }, allow_blank: true
  validates :job_search_status, inclusion: { in: %w[active inactive graduated] }, allow_blank: true
  
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id'
  has_many :companies, dependent: :destroy
  has_many :job_postings, through: :companies
  
  # Student applications
  has_many :applications, foreign_key: 'student_id', dependent: :destroy
  has_many :applied_job_postings, through: :applications, source: :job_posting
  
  # Invitations (scouting)
  has_many :sent_invitations, class_name: 'Invitation', foreign_key: 'company_id', dependent: :destroy
  has_many :received_invitations, class_name: 'Invitation', foreign_key: 'student_id', dependent: :destroy
  
  has_many :user1_conversations, class_name: 'Conversation', foreign_key: 'user1_id'
  has_many :user2_conversations, class_name: 'Conversation', foreign_key: 'user2_id'

  scope :students, -> { where(user_type: 'student') }
  scope :companies, -> { where(user_type: 'company') }
  scope :active_job_seekers, -> { students.where(job_search_status: 'active') }
  scope :by_major, ->(major) { where(major: major) }
  scope :by_preferred_location, ->(location) { where(preferred_location: location) }
  scope :by_experience_level, ->(level) { where(experience_level: level) }
  scope :by_graduation_year, ->(year) { where(graduation_year: year) }
  scope :with_programming_language, ->(language) { 
    where("programming_languages ILIKE ?", "%#{language}%") 
  }
  
  def full_name
    "#{first_name} #{last_name}"
  end
  
  def name
    full_name
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
  
  def programming_languages_array
    return [] if programming_languages.blank?
    JSON.parse(programming_languages) rescue []
  end
  
  def programming_languages_array=(languages)
    self.programming_languages = languages.to_json
  end
  
  # 学生検索用のスコープを組み合わせるクラスメソッド
  def self.search_students(filters = {})
    scope = active_job_seekers
    
    scope = scope.by_major(filters[:major]) if filters[:major].present?
    scope = scope.by_preferred_location(filters[:preferred_location]) if filters[:preferred_location].present?
    scope = scope.by_experience_level(filters[:experience_level]) if filters[:experience_level].present?
    scope = scope.by_graduation_year(filters[:graduation_year]) if filters[:graduation_year].present?
    scope = scope.with_programming_language(filters[:programming_language]) if filters[:programming_language].present?
    
    if filters[:skills].present?
      scope = scope.where("skills ILIKE ?", "%#{filters[:skills]}%")
    end
    
    scope
  end
end
