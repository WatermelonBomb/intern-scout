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
      get 'auth/me', to: 'auth#me'
      
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
      resources :job_postings, only: [:index, :show, :create, :update, :destroy] do
        resources :applications, only: [:create]
      end
      
      # Applications
      resources :applications, only: [:index, :show, :update, :destroy]
      
      # Invitations (scouting)
      resources :invitations, only: [:index, :show, :create, :destroy] do
        collection do
          post :bulk_create
        end
        member do
          patch :accept
          patch :reject
        end
      end
      
      # Students (for company search)
      resources :students, only: [:index] do
        collection do
          get :filter_options
        end
      end
      
      # Scout Templates
      resources :scout_templates do
        member do
          post :clone
        end
      end
      
      # Selection Processes
      resources :selection_processes, only: [:index, :show, :create, :update, :destroy] do
        member do
          patch :start
          patch :complete
        end
      end
      
      # Dashboard
      get 'dashboard/stats', to: 'dashboard#stats'
      
      # Technologies
      resources :technologies, only: [:index, :show] do
        collection do
          get :trending
        end
        member do
          get :combinations
        end
      end
      
      # Tech Search
      post 'search/companies', to: 'tech_search#search_companies'
      post 'search/jobs', to: 'tech_search#search_jobs'
      
      # Company Tech Stacks
      resources :companies, only: [] do
        resources :tech_stacks, controller: 'company_tech_stacks', except: [:new, :edit] do
          collection do
            post :bulk_create
            get :suggestions
          end
        end
      end
      
      # Current company's tech stacks (for authenticated company users)
      resources :tech_stacks, controller: 'company_tech_stacks', except: [:new, :edit] do
        collection do
          post :bulk_create
          get :suggestions
        end
      end
      
      # Student Tech Interests
      resources :tech_interests, controller: 'student_tech_interests', except: [:new, :edit] do
        collection do
          post :bulk_create
          get :recommendations
        end
      end
      
      # Learning Path
      get 'learning_path/:company_id', to: 'student_tech_interests#learning_path'
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
