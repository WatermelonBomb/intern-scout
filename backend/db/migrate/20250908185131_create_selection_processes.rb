class CreateSelectionProcesses < ActiveRecord::Migration[8.0]
  def change
    create_table :selection_processes do |t|
      t.references :application, null: false, foreign_key: true
      t.string :process_type, null: false
      t.string :title, null: false
      t.text :description
      t.text :url
      t.datetime :due_date
      t.datetime :completed_at
      t.string :status, default: 'assigned'

      t.timestamps
    end

    add_index :selection_processes, [:application_id, :process_type]
    add_index :selection_processes, [:application_id, :status]
    add_index :selection_processes, :due_date
  end
end
