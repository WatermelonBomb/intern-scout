class Api::V1::MessagesController < ApplicationController
  before_action :set_message, only: [:show, :mark_as_read]

  def index
    # Get messages where current user is sender or receiver
    messages = Message.where(
      "(sender_id = ? OR receiver_id = ?)", 
      current_user.id, current_user.id
    ).includes(:sender, :receiver).order(created_at: :desc)
    
    render json: messages.map { |message| message_response(message) }
  end

  def show
    if @message.sender == current_user || @message.receiver == current_user
      render json: message_response(@message)
    else
      render json: { errors: ['Not authorized'] }, status: :forbidden
    end
  end

  def create
    receiver = User.find(params[:receiver_id])
    
    # Allow bidirectional messaging between students and companies
    unless (current_user.company? && receiver.student?) || (current_user.student? && receiver.company?)
      render json: { errors: ['Messages can only be sent between students and companies'] }, status: :forbidden
      return
    end
    
    message = current_user.sent_messages.build(message_params)
    message.receiver = receiver
    
    # If conversation_id is provided, associate the message with the conversation
    if params[:conversation_id].present?
      conversation = current_user.conversations.find(params[:conversation_id])
      message.conversation = conversation
    end
    
    if message.save
      render json: message_response(message), status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound => e
    if e.message.include?('Conversation')
      render json: { errors: ['Conversation not found'] }, status: :not_found
    else
      render json: { errors: ['Receiver not found'] }, status: :not_found
    end
  end
  
  def mark_as_read
    if @message.receiver == current_user
      @message.mark_as_read!
      render json: message_response(@message)
    else
      render json: { errors: ['Not authorized'] }, status: :forbidden
    end
  end

  private

  def set_message
    @message = Message.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Message not found'] }, status: :not_found
  end

  def message_params
    params.permit(:subject, :content, :receiver_id, :conversation_id)
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
