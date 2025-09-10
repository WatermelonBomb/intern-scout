class ScoutTemplate < ApplicationRecord
  belongs_to :company
  has_many :invitations, dependent: :nullify
  
  validates :name, presence: true
  validates :message, presence: true
  validates :subject, presence: true
  
  scope :active, -> { where(is_active: true) }
  scope :recent, -> { order(updated_at: :desc) }
  
  def clone_for_company(target_company)
    self.dup.tap do |template|
      template.company = target_company
      template.name = "#{name} (コピー)"
      template.save
    end
  end
end