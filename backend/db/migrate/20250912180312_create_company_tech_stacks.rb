class CreateCompanyTechStacks < ActiveRecord::Migration[8.0]
  def change
    create_table :company_tech_stacks do |t|
      t.references :company, null: false, foreign_key: true
      t.references :technology, null: false, foreign_key: true
      t.string :usage_level, null: false, default: 'main'
      t.integer :years_used, default: 1
      t.integer :team_size
      t.text :project_example
      t.boolean :is_main_tech, default: false

      t.timestamps
    end

    add_index :company_tech_stacks, [:company_id, :technology_id], unique: true
    add_index :company_tech_stacks, :usage_level
    add_index :company_tech_stacks, :is_main_tech
  end
end
