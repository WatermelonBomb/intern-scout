class CreateTechnologies < ActiveRecord::Migration[8.0]
  def change
    create_table :technologies do |t|
      t.string :name, null: false
      t.string :category, null: false
      t.text :description
      t.string :official_url
      t.string :logo_url
      t.integer :learning_difficulty, default: 1
      t.decimal :market_demand_score, precision: 3, scale: 1, default: 0.0
      t.decimal :popularity_score, precision: 3, scale: 1, default: 0.0

      t.timestamps
    end

    add_index :technologies, :name, unique: true
    add_index :technologies, :category
    add_index :technologies, :popularity_score
  end
end
