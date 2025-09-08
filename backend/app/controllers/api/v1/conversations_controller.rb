class Api::V1::ConversationsController < ApplicationController
  before_action :set_conversation, only: [:show]

  def index
    conversations = current_user.conversations.includes(:user1, :user2, :messages)
    render json: conversations.map { |conversation| conversation_response(conversation) }
  end

  def show
    messages = @conversation.messages.includes(:sender, :receiver).order(:created_at)
    render json: {
      conversation: conversation_response(@conversation),
      messages: messages.map { |message| message_response(message) }
    }
  end

  def create
    other_user = User.find(params[:user_id])
    conversation = Conversation.find_or_create_between(current_user, other_user)
    render json: conversation_response(conversation), status: :created
  end

  private

  def set_conversation
    @conversation = current_user.conversations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Conversation not found'] }, status: :not_found
  end

  def conversation_response(conversation)
    other_user = conversation.other_user(current_user)
    last_message = conversation.last_message

    {
      id: conversation.id,
      other_user: {
        id: other_user.id,
        full_name: other_user.full_name,
        email: other_user.email,
        user_type: other_user.user_type
      },
      last_message: last_message ? {
        id: last_message.id,
        content: last_message.content,
        created_at: last_message.created_at,
        sender_id: last_message.sender_id
      } : nil,
      last_message_at: conversation.last_message_at,
      unread_count: conversation.unread_count_for(current_user),
      created_at: conversation.created_at
    }
  end

  def message_response(message)
    {
      id: message.id,
      subject: message.subject,
      content: message.content,
      read_at: message.read_at,
      read: message.read?,
      created_at: message.created_at,
      sender: {
        id: message.sender.id,
        full_name: message.sender.full_name,
        email: message.sender.email,
        user_type: message.sender.user_type
      },
      receiver: {
        id: message.receiver.id,
        full_name: message.receiver.full_name,
        email: message.receiver.email,
        user_type: message.receiver.user_type
      }
    }
  end
end