class CreateApplications < ActiveRecord::Migration[8.0]
  def change
    create_table :applications do |t|
      t.references :student, null: false, foreign_key: { to_table: :users }
      t.references :job_posting, null: false, foreign_key: true
      t.text :cover_letter
      t.string :status, default: 'pending'
      t.datetime :applied_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.datetime :reviewed_at

      t.timestamps
    end

    add_index :applications, [:student_id, :job_posting_id], unique: true
    add_index :applications, [:job_posting_id, :status]
    add_index :applications, [:student_id, :status]
  end
end
