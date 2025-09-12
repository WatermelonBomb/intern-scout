class Company < ApplicationRecord
  belongs_to :user
  has_many :job_postings, dependent: :destroy
  has_many :scout_templates, dependent: :destroy
  has_many :company_tech_stacks, dependent: :destroy
  has_many :technologies, through: :company_tech_stacks
  
  validates :name, :industry, presence: true
  validates :tech_culture_score, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 10 }, allow_nil: true
  validates :open_source_contributions, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :tech_blog_url, :github_org_url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]), allow_blank: true }
  
  scope :with_tech_stack, -> { joins(:company_tech_stacks).distinct }
  scope :using_technology, ->(tech_id) { joins(:company_tech_stacks).where(company_tech_stacks: { technology_id: tech_id }) }
  scope :with_tech_culture_score, ->(min_score) { where('tech_culture_score >= ?', min_score) }
  scope :active_oss_contributors, -> { where('open_source_contributions > 0') }
  
  def main_technologies
    technologies.joins(:company_tech_stacks)
                .where(company_tech_stacks: { usage_level: 'main', company_id: id })
  end
  
  def sub_technologies
    technologies.joins(:company_tech_stacks)
                .where(company_tech_stacks: { usage_level: 'sub', company_id: id })
  end
  
  def tech_stack_by_category
    technologies.joins(:company_tech_stacks)
                .where(company_tech_stacks: { company_id: id })
                .group_by(&:category)
  end
  
  def tech_stack_freshness_score
    return 0 unless tech_stack_last_updated
    
    days_since_update = (Date.current - tech_stack_last_updated.to_date).to_i
    case days_since_update
    when 0..30 then 10
    when 31..90 then 8
    when 91..180 then 6
    when 181..365 then 4
    else 2
    end
  end
  
  def update_tech_stack_timestamp!
    update!(tech_stack_last_updated: Time.current)
  end
  
  def self.search_by_technologies(tech_ids, options = {})
    return none if tech_ids.blank?
    
    companies = joins(:company_tech_stacks)
                .where(company_tech_stacks: { technology_id: tech_ids })
                .distinct
    
    if options[:usage_level].present?
      companies = companies.where(company_tech_stacks: { usage_level: options[:usage_level] })
    end
    
    if options[:min_years].present?
      companies = companies.where('company_tech_stacks.years_used >= ?', options[:min_years])
    end
    
    companies
  end
end
