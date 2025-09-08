class AddConversationToMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :messages, :conversation_id, :bigint
    add_index :messages, :conversation_id
  end
end
