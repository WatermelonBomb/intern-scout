class Company < ApplicationRecord
  belongs_to :user
  has_many :job_postings, dependent: :destroy
  
  validates :name, :industry, presence: true
end
