class AddTechStackFieldsToJobPostings < ActiveRecord::Migration[8.0]
  def change
    add_column :job_postings, :required_tech_ids, :json
    add_column :job_postings, :preferred_tech_ids, :json
    add_column :job_postings, :tech_learning_opportunities, :text
    add_column :job_postings, :project_tech_stack, :json
  end
end
