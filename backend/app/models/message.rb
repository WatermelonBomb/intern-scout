class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  belongs_to :conversation, optional: true
  
  validates :subject, :content, presence: true
  
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  
  after_create :ensure_conversation
  after_create :update_conversation_timestamp
  
  def read?
    read_at.present?
  end
  
  def mark_as_read!
    update(read_at: Time.current)
  end

  private

  def ensure_conversation
    return if conversation.present?

    conv = Conversation.find_or_create_between(sender, receiver)
    update_column(:conversation_id, conv.id)
  end

  def update_conversation_timestamp
    conversation&.update_last_message_time!
  end
end
