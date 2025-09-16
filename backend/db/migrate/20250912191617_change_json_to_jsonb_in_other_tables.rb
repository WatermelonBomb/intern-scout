class ChangeJsonToJsonbInOtherTables < ActiveRecord::Migration[8.0]
  def up
    # Change tech_search_logs JSON fields to JSONB
    change_column :tech_search_logs, :selected_technologies, :jsonb
    change_column :tech_search_logs, :clicked_companies, :jsonb
    
    # Add GIN indexes
    add_index :tech_search_logs, :selected_technologies, using: :gin
    add_index :tech_search_logs, :clicked_companies, using: :gin
  end
  
  def down
    remove_index :tech_search_logs, :selected_technologies
    remove_index :tech_search_logs, :clicked_companies
    
    change_column :tech_search_logs, :selected_technologies, :json
    change_column :tech_search_logs, :clicked_companies, :json
  end
end
