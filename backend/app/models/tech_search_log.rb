class TechSearchLog < ApplicationRecord
  belongs_to :user
  
  validates :search_type, presence: true
  validates :result_count, numericality: { greater_than_or_equal_to: 0 }
  validates :match_score_threshold, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true
  
  SEARCH_TYPES = %w[company_search job_search tech_exploration].freeze
  validates :search_type, inclusion: { in: SEARCH_TYPES }
  
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :successful, -> { where('result_count > 0') }
  
  def selected_tech_names
    return [] unless selected_technologies
    
    tech_ids = selected_technologies['required'] || []
    Technology.where(id: tech_ids).pluck(:name)
  end
  
  def clicked_company_names
    return [] unless clicked_companies
    
    company_ids = clicked_companies.is_a?(Array) ? clicked_companies : []
    Company.where(id: company_ids).pluck(:name)
  end
end