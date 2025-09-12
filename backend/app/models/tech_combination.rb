class TechCombination < ApplicationRecord
  belongs_to :primary_tech, class_name: 'Technology'
  belongs_to :secondary_tech, class_name: 'Technology'
  
  validates :primary_tech_id, uniqueness: { scope: :secondary_tech_id }
  validates :popularity_score, numericality: { greater_than_or_equal_to: 0 }
  validates :combination_type, presence: true
  
  COMBINATION_TYPES = %w[common frontend_backend framework_library language_framework backend_database].freeze
  validates :combination_type, inclusion: { in: COMBINATION_TYPES }
  
  scope :popular, -> { order(popularity_score: :desc) }
  scope :by_type, ->(type) { where(combination_type: type) }
  
  def self.find_combinations_for_tech(technology_id)
    where(primary_tech_id: technology_id)
      .or(where(secondary_tech_id: technology_id))
      .includes(:primary_tech, :secondary_tech)
      .popular
  end
end