class CompanyTechStack < ApplicationRecord
  belongs_to :company
  belongs_to :technology
  
  validates :usage_level, presence: true
  validates :years_used, numericality: { greater_than: 0 }
  validates :team_size, numericality: { greater_than: 0 }, allow_nil: true
  validates :company_id, uniqueness: { scope: :technology_id }
  
  USAGE_LEVELS = %w[main sub experimental].freeze
  validates :usage_level, inclusion: { in: USAGE_LEVELS }
  
  scope :main_technologies, -> { where(usage_level: 'main') }
  scope :sub_technologies, -> { where(usage_level: 'sub') }
  scope :experimental_technologies, -> { where(usage_level: 'experimental') }
  scope :main_tech, -> { where(is_main_tech: true) }
  
  def usage_level_display
    {
      'main' => 'メイン技術',
      'sub' => 'サブ技術', 
      'experimental' => '実験的導入'
    }[usage_level]
  end
end