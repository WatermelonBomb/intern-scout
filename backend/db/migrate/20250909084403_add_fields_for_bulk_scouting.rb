class AddFieldsForBulkScouting < ActiveRecord::Migration[8.0]
  def change
    # Add fields to users table for better student filtering
    add_column :users, :major, :string # 専攻
    add_column :users, :preferred_location, :string # 希望勤務地
    add_column :users, :programming_languages, :text # プログラミング言語（JSON形式で保存）
    add_column :users, :experience_level, :string # 経験レベル（beginner, intermediate, advanced）
    add_column :users, :job_search_status, :string, default: 'active' # 就職活動ステータス
    
    # Create scout templates table for companies
    create_table :scout_templates do |t|
      t.references :company, null: false, foreign_key: true
      t.string :name, null: false # テンプレート名
      t.string :subject # 件名
      t.text :message, null: false # メッセージ内容
      t.boolean :is_active, default: true
      t.timestamps
    end
    
    # Add bulk scouting tracking
    add_column :invitations, :scout_template_id, :bigint
    add_column :invitations, :campaign_id, :string # 一括送信の識別ID
    add_column :invitations, :is_bulk_sent, :boolean, default: false
    
    add_index :users, :major
    add_index :users, :preferred_location
    add_index :users, :experience_level
    add_index :users, :job_search_status
    add_index :invitations, :campaign_id
    add_index :invitations, :scout_template_id
    
    add_foreign_key :invitations, :scout_templates, column: :scout_template_id
  end
end
