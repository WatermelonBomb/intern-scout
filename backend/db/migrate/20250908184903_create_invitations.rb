class CreateInvitations < ActiveRecord::Migration[8.0]
  def change
    create_table :invitations do |t|
      t.references :company, null: false, foreign_key: { to_table: :users }
      t.references :student, null: false, foreign_key: { to_table: :users }
      t.references :job_posting, null: false, foreign_key: true
      t.text :message
      t.string :status, default: 'sent'
      t.datetime :sent_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.datetime :responded_at

      t.timestamps
    end

    add_index :invitations, [:company_id, :student_id, :job_posting_id], unique: true, name: 'index_invitations_unique'
    add_index :invitations, [:student_id, :status]
    add_index :invitations, [:company_id, :status]
  end
end
