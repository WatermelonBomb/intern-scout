class Company < ApplicationRecord
  belongs_to :user
  has_many :job_postings, dependent: :destroy
  has_many :scout_templates, dependent: :destroy
  
  validates :name, :industry, presence: true
end
