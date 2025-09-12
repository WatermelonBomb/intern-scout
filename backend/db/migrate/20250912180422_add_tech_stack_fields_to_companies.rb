class AddTechStackFieldsToCompanies < ActiveRecord::Migration[8.0]
  def change
    add_column :companies, :tech_stack_last_updated, :datetime
    add_column :companies, :tech_blog_url, :string
    add_column :companies, :github_org_url, :string
    add_column :companies, :tech_culture_score, :decimal, precision: 3, scale: 1, default: 0.0
    add_column :companies, :open_source_contributions, :integer, default: 0

    add_index :companies, :tech_stack_last_updated
    add_index :companies, :tech_culture_score
  end
end
