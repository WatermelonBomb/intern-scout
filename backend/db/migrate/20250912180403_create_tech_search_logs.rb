class CreateTechSearchLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :tech_search_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.text :search_query
      t.json :selected_technologies
      t.integer :result_count, default: 0
      t.json :clicked_companies
      t.string :search_type, default: 'company_search'
      t.decimal :match_score_threshold, precision: 5, scale: 2

      t.timestamps
    end

    add_index :tech_search_logs, :created_at
    add_index :tech_search_logs, :search_type
    add_index :tech_search_logs, :result_count
  end
end
