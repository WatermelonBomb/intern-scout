Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      post 'auth/signup', to: 'auth#signup'
      post 'auth/login', to: 'auth#login'
      delete 'auth/logout', to: 'auth#logout'
      
      # Users
      resources :users, only: [:index, :show, :update] do
        collection do
          get :search
        end
      end
      
      # Messages
      resources :messages, only: [:index, :show, :create] do
        member do
          patch :mark_as_read
        end
      end
      
      # Conversations
      resources :conversations, only: [:index, :show, :create]
      
      # Job Postings
      resources :job_postings, only: [:index, :show, :create, :update, :destroy]
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
