class Conversation < ApplicationRecord
  belongs_to :user1, class_name: 'User'
  belongs_to :user2, class_name: 'User'
  has_many :messages, dependent: :destroy

  validates :user1_id, presence: true
  validates :user2_id, presence: true
  validates :user1_id, uniqueness: { scope: :user2_id }

  scope :for_user, ->(user) { where('user1_id = ? OR user2_id = ?', user.id, user.id) }
  scope :recent, -> { order(Arel.sql('last_message_at DESC NULLS LAST')) }

  def self.between(user1, user2)
    where(
      "(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
      user1.id, user2.id, user2.id, user1.id
    ).first
  end

  def self.find_or_create_between(user1, user2)
    conversation = between(user1, user2)
    return conversation if conversation

    # Ensure consistent ordering to avoid duplicate conversations
    if user1.id < user2.id
      create!(user1: user1, user2: user2)
    else
      create!(user1: user2, user2: user1)
    end
  end

  def other_user(current_user)
    user1 == current_user ? user2 : user1
  end

  def last_message
    messages.order(:created_at).last
  end

  def update_last_message_time!
    update!(last_message_at: Time.current)
  end

  def unread_count_for(user)
    messages.where(receiver: user, read_at: nil).count
  end
end
