class CreateTechCombinations < ActiveRecord::Migration[8.0]
  def change
    create_table :tech_combinations do |t|
      t.references :primary_tech, null: false, foreign_key: { to_table: :technologies }
      t.references :secondary_tech, null: false, foreign_key: { to_table: :technologies }
      t.decimal :popularity_score, precision: 5, scale: 2, default: 0.0
      t.string :combination_type, default: 'common'

      t.timestamps
    end

    add_index :tech_combinations, [:primary_tech_id, :secondary_tech_id], unique: true, name: 'idx_tech_combination_unique'
    add_index :tech_combinations, :popularity_score
    add_index :tech_combinations, :combination_type
  end
end
