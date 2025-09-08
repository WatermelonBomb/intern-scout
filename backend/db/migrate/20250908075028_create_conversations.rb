class CreateConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :conversations do |t|
      t.bigint :user1_id, null: false
      t.bigint :user2_id, null: false
      t.datetime :last_message_at

      t.timestamps
    end

    add_index :conversations, [:user1_id, :user2_id], unique: true
    add_index :conversations, [:user2_id, :user1_id], unique: true
    add_foreign_key :conversations, :users, column: :user1_id
    add_foreign_key :conversations, :users, column: :user2_id
  end
end
