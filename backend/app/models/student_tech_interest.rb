class StudentTechInterest < ApplicationRecord
  belongs_to :user
  belongs_to :technology
  
  validates :user_id, uniqueness: { scope: :technology_id }
  validates :skill_level, presence: true
  validates :learning_priority, numericality: { greater_than: 0, less_than_or_equal_to: 10 }
  validates :interest_type, presence: true
  
  SKILL_LEVELS = %w[beginner intermediate advanced expert].freeze
  validates :skill_level, inclusion: { in: SKILL_LEVELS }
  
  INTEREST_TYPES = %w[want_to_learn currently_learning experienced_with expert_in].freeze
  validates :interest_type, inclusion: { in: INTEREST_TYPES }
  
  scope :by_skill_level, ->(level) { where(skill_level: level) }
  scope :high_priority, -> { where('learning_priority >= ?', 7) }
  scope :want_to_learn, -> { where(interest_type: 'want_to_learn') }
  scope :experienced, -> { where(interest_type: ['experienced_with', 'expert_in']) }
  
  def skill_level_display
    {
      'beginner' => '未経験',
      'intermediate' => '初級',
      'advanced' => '中級',
      'expert' => '上級'
    }[skill_level]
  end
  
  def interest_type_display
    {
      'want_to_learn' => '学びたい',
      'currently_learning' => '学習中',
      'experienced_with' => '経験あり',
      'expert_in' => 'エキスパート'
    }[interest_type]
  end
end