class CreateStudentTechInterests < ActiveRecord::Migration[8.0]
  def change
    create_table :student_tech_interests do |t|
      t.references :user, null: false, foreign_key: true
      t.references :technology, null: false, foreign_key: true
      t.string :skill_level, null: false, default: 'beginner'
      t.integer :learning_priority, default: 1
      t.string :interest_type, default: 'want_to_learn'

      t.timestamps
    end

    add_index :student_tech_interests, [:user_id, :technology_id], unique: true
    add_index :student_tech_interests, :skill_level
    add_index :student_tech_interests, :learning_priority
    add_index :student_tech_interests, :interest_type
  end
end
