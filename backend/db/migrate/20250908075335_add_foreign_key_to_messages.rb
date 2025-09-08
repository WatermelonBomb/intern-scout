class AddForeignKeyToMessages < ActiveRecord::Migration[8.0]
  def change
    add_foreign_key :messages, :conversations, column: :conversation_id
  end
end
