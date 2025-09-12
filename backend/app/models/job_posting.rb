class JobPosting < ApplicationRecord
  belongs_to :company
  has_many :applications, dependent: :destroy
  has_many :applicants, through: :applications, source: :student
  has_many :invitations, dependent: :destroy
  has_many :invited_students, through: :invitations, source: :student
  
  validates :title, :description, presence: true
  validates :employment_type, inclusion: { in: %w[internship part_time full_time contract] }
  
  scope :active, -> { where('deadline IS NULL OR deadline > ?', Date.current) }
  scope :expired, -> { where('deadline <= ?', Date.current) }
  scope :with_required_tech, ->(tech_ids) { where('required_tech_ids @> ?', tech_ids.to_json) }
  scope :with_preferred_tech, ->(tech_ids) { where('preferred_tech_ids @> ?', tech_ids.to_json) }
  
  def active?
    deadline.nil? || deadline > Date.current
  end
  
  def expired?
    !active?
  end

  def applications_count
    applications.count
  end

  def pending_applications_count
    applications.pending.count
  end

  def has_application_from?(user)
    return false unless user&.student?
    applications.exists?(student: user)
  end

  def application_from(user)
    return nil unless user&.student?
    applications.find_by(student: user)
  end
  
  def required_technologies
    return Technology.none if required_tech_ids.blank?
    Technology.where(id: required_tech_ids)
  end
  
  def preferred_technologies
    return Technology.none if preferred_tech_ids.blank?
    Technology.where(id: preferred_tech_ids)
  end
  
  def project_technologies
    return Technology.none if project_tech_stack.blank?
    tech_ids = project_tech_stack.is_a?(Array) ? project_tech_stack : []
    Technology.where(id: tech_ids)
  end
  
  def tech_match_score(student_tech_ids)
    return 0 if student_tech_ids.blank?
    
    required_match = required_tech_ids.present? ? 
      (required_tech_ids & student_tech_ids).size.to_f / required_tech_ids.size * 60 : 0
    
    preferred_match = preferred_tech_ids.present? ? 
      (preferred_tech_ids & student_tech_ids).size.to_f / preferred_tech_ids.size * 40 : 0
    
    (required_match + preferred_match).round(2)
  end
  
  def self.search_by_technologies(tech_ids, options = {})
    return none if tech_ids.blank?
    
    query = all
    
    if options[:required_match] == 'all'
      tech_ids.each do |tech_id|
        query = query.where('required_tech_ids @> ?', [tech_id].to_json)
      end
    elsif options[:required_match] == 'any'
      query = query.where('required_tech_ids && ?', tech_ids.to_json)
    end
    
    if options[:preferred_match] == 'any'
      query = query.where('preferred_tech_ids && ?', tech_ids.to_json)
    end
    
    query
  end
end
