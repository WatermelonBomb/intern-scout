class ChangeJsonToJsonbInJobPostings < ActiveRecord::Migration[8.0]
  def up
    change_column :job_postings, :required_tech_ids, :jsonb
    change_column :job_postings, :preferred_tech_ids, :jsonb
    change_column :job_postings, :project_tech_stack, :jsonb
    
    # Add GIN indexes for better performance
    add_index :job_postings, :required_tech_ids, using: :gin
    add_index :job_postings, :preferred_tech_ids, using: :gin
  end
  
  def down
    remove_index :job_postings, :required_tech_ids
    remove_index :job_postings, :preferred_tech_ids
    
    change_column :job_postings, :required_tech_ids, :json
    change_column :job_postings, :preferred_tech_ids, :json
    change_column :job_postings, :project_tech_stack, :json
  end
end
