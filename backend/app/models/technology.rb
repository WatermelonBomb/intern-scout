class Technology < ApplicationRecord
  has_many :company_tech_stacks, dependent: :destroy
  has_many :companies, through: :company_tech_stacks
  
  has_many :student_tech_interests, dependent: :destroy
  has_many :interested_students, through: :student_tech_interests, source: :user
  
  has_many :primary_tech_combinations, class_name: 'TechCombination', foreign_key: 'primary_tech_id', dependent: :destroy
  has_many :secondary_tech_combinations, class_name: 'TechCombination', foreign_key: 'secondary_tech_id', dependent: :destroy
  
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :category, presence: true
  validates :learning_difficulty, inclusion: { in: 1..5 }
  validates :market_demand_score, :popularity_score, 
            numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }
  
  scope :by_category, ->(category) { where(category: category) }
  scope :popular, -> { order(popularity_score: :desc) }
  scope :in_demand, -> { order(market_demand_score: :desc) }
  scope :beginner_friendly, -> { where(learning_difficulty: 1..2) }
  
  CATEGORIES = %w[
    frontend
    backend
    database
    devops
    mobile
    ai_ml
    data_science
    testing
    design
    other
  ].freeze
  
  validates :category, inclusion: { in: CATEGORIES }
  
  def related_technologies
    primary_combinations = TechCombination.where(primary_tech_id: id).includes(:secondary_tech)
    secondary_combinations = TechCombination.where(secondary_tech_id: id).includes(:primary_tech)
    
    related = []
    related += primary_combinations.map(&:secondary_tech)
    related += secondary_combinations.map(&:primary_tech)
    
    related.uniq
  end
  
  def companies_using_count
    companies.count
  end
  
  def interested_students_count
    interested_students.count
  end
end