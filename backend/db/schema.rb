# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_12_191617) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "applications", force: :cascade do |t|
    t.bigint "student_id", null: false
    t.bigint "job_posting_id", null: false
    t.text "cover_letter"
    t.string "status", default: "pending"
    t.datetime "applied_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "reviewed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_posting_id", "status"], name: "index_applications_on_job_posting_id_and_status"
    t.index ["job_posting_id"], name: "index_applications_on_job_posting_id"
    t.index ["student_id", "job_posting_id"], name: "index_applications_on_student_id_and_job_posting_id", unique: true
    t.index ["student_id", "status"], name: "index_applications_on_student_id_and_status"
    t.index ["student_id"], name: "index_applications_on_student_id"
  end

  create_table "companies", force: :cascade do |t|
    t.string "name"
    t.string "industry"
    t.text "description"
    t.string "website"
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.datetime "tech_stack_last_updated"
    t.string "tech_blog_url"
    t.string "github_org_url"
    t.decimal "tech_culture_score", precision: 3, scale: 1, default: "0.0"
    t.integer "open_source_contributions", default: 0
    t.index ["tech_culture_score"], name: "index_companies_on_tech_culture_score"
    t.index ["tech_stack_last_updated"], name: "index_companies_on_tech_stack_last_updated"
    t.index ["user_id"], name: "index_companies_on_user_id"
  end

  create_table "company_tech_stacks", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.bigint "technology_id", null: false
    t.string "usage_level", default: "main", null: false
    t.integer "years_used", default: 1
    t.integer "team_size"
    t.text "project_example"
    t.boolean "is_main_tech", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "technology_id"], name: "index_company_tech_stacks_on_company_id_and_technology_id", unique: true
    t.index ["company_id"], name: "index_company_tech_stacks_on_company_id"
    t.index ["is_main_tech"], name: "index_company_tech_stacks_on_is_main_tech"
    t.index ["technology_id"], name: "index_company_tech_stacks_on_technology_id"
    t.index ["usage_level"], name: "index_company_tech_stacks_on_usage_level"
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "user1_id", null: false
    t.bigint "user2_id", null: false
    t.datetime "last_message_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user1_id", "user2_id"], name: "index_conversations_on_user1_id_and_user2_id", unique: true
    t.index ["user2_id", "user1_id"], name: "index_conversations_on_user2_id_and_user1_id", unique: true
  end

  create_table "invitations", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.bigint "student_id", null: false
    t.bigint "job_posting_id", null: false
    t.text "message"
    t.string "status", default: "sent"
    t.datetime "sent_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "responded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "scout_template_id"
    t.string "campaign_id"
    t.boolean "is_bulk_sent", default: false
    t.index ["campaign_id"], name: "index_invitations_on_campaign_id"
    t.index ["company_id", "status"], name: "index_invitations_on_company_id_and_status"
    t.index ["company_id", "student_id", "job_posting_id"], name: "index_invitations_unique", unique: true
    t.index ["company_id"], name: "index_invitations_on_company_id"
    t.index ["job_posting_id"], name: "index_invitations_on_job_posting_id"
    t.index ["scout_template_id"], name: "index_invitations_on_scout_template_id"
    t.index ["student_id", "status"], name: "index_invitations_on_student_id_and_status"
    t.index ["student_id"], name: "index_invitations_on_student_id"
  end

  create_table "job_postings", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.string "title"
    t.text "description"
    t.text "requirements"
    t.string "location"
    t.string "salary_range"
    t.string "employment_type"
    t.date "deadline"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "required_tech_ids"
    t.jsonb "preferred_tech_ids"
    t.text "tech_learning_opportunities"
    t.jsonb "project_tech_stack"
    t.index ["company_id"], name: "index_job_postings_on_company_id"
    t.index ["preferred_tech_ids"], name: "index_job_postings_on_preferred_tech_ids", using: :gin
    t.index ["required_tech_ids"], name: "index_job_postings_on_required_tech_ids", using: :gin
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "receiver_id", null: false
    t.string "subject"
    t.text "content"
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "conversation_id"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["receiver_id"], name: "index_messages_on_receiver_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "scout_templates", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.string "name", null: false
    t.string "subject"
    t.text "message", null: false
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_scout_templates_on_company_id"
  end

  create_table "selection_processes", force: :cascade do |t|
    t.bigint "application_id", null: false
    t.string "process_type", null: false
    t.string "title", null: false
    t.text "description"
    t.text "url"
    t.datetime "due_date"
    t.datetime "completed_at"
    t.string "status", default: "assigned"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["application_id", "process_type"], name: "index_selection_processes_on_application_id_and_process_type"
    t.index ["application_id", "status"], name: "index_selection_processes_on_application_id_and_status"
    t.index ["application_id"], name: "index_selection_processes_on_application_id"
    t.index ["due_date"], name: "index_selection_processes_on_due_date"
  end

  create_table "student_tech_interests", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "technology_id", null: false
    t.string "skill_level", default: "beginner", null: false
    t.integer "learning_priority", default: 1
    t.string "interest_type", default: "want_to_learn"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["interest_type"], name: "index_student_tech_interests_on_interest_type"
    t.index ["learning_priority"], name: "index_student_tech_interests_on_learning_priority"
    t.index ["skill_level"], name: "index_student_tech_interests_on_skill_level"
    t.index ["technology_id"], name: "index_student_tech_interests_on_technology_id"
    t.index ["user_id", "technology_id"], name: "index_student_tech_interests_on_user_id_and_technology_id", unique: true
    t.index ["user_id"], name: "index_student_tech_interests_on_user_id"
  end

  create_table "tech_combinations", force: :cascade do |t|
    t.bigint "primary_tech_id", null: false
    t.bigint "secondary_tech_id", null: false
    t.decimal "popularity_score", precision: 5, scale: 2, default: "0.0"
    t.string "combination_type", default: "common"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["combination_type"], name: "index_tech_combinations_on_combination_type"
    t.index ["popularity_score"], name: "index_tech_combinations_on_popularity_score"
    t.index ["primary_tech_id", "secondary_tech_id"], name: "idx_tech_combination_unique", unique: true
    t.index ["primary_tech_id"], name: "index_tech_combinations_on_primary_tech_id"
    t.index ["secondary_tech_id"], name: "index_tech_combinations_on_secondary_tech_id"
  end

  create_table "tech_search_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "search_query"
    t.jsonb "selected_technologies"
    t.integer "result_count", default: 0
    t.jsonb "clicked_companies"
    t.string "search_type", default: "company_search"
    t.decimal "match_score_threshold", precision: 5, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["clicked_companies"], name: "index_tech_search_logs_on_clicked_companies", using: :gin
    t.index ["created_at"], name: "index_tech_search_logs_on_created_at"
    t.index ["result_count"], name: "index_tech_search_logs_on_result_count"
    t.index ["search_type"], name: "index_tech_search_logs_on_search_type"
    t.index ["selected_technologies"], name: "index_tech_search_logs_on_selected_technologies", using: :gin
    t.index ["user_id"], name: "index_tech_search_logs_on_user_id"
  end

  create_table "technologies", force: :cascade do |t|
    t.string "name", null: false
    t.string "category", null: false
    t.text "description"
    t.string "official_url"
    t.string "logo_url"
    t.integer "learning_difficulty", default: 1
    t.decimal "market_demand_score", precision: 3, scale: 1, default: "0.0"
    t.decimal "popularity_score", precision: 3, scale: 1, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_technologies_on_category"
    t.index ["name"], name: "index_technologies_on_name", unique: true
    t.index ["popularity_score"], name: "index_technologies_on_popularity_score"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "user_type", null: false
    t.string "university"
    t.integer "graduation_year"
    t.text "bio"
    t.text "skills"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "major"
    t.string "preferred_location"
    t.text "programming_languages"
    t.string "experience_level"
    t.string "job_search_status", default: "active"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["experience_level"], name: "index_users_on_experience_level"
    t.index ["job_search_status"], name: "index_users_on_job_search_status"
    t.index ["major"], name: "index_users_on_major"
    t.index ["preferred_location"], name: "index_users_on_preferred_location"
    t.index ["user_type"], name: "index_users_on_user_type"
  end

  add_foreign_key "applications", "job_postings"
  add_foreign_key "applications", "users", column: "student_id"
  add_foreign_key "companies", "users"
  add_foreign_key "company_tech_stacks", "companies"
  add_foreign_key "company_tech_stacks", "technologies"
  add_foreign_key "conversations", "users", column: "user1_id"
  add_foreign_key "conversations", "users", column: "user2_id"
  add_foreign_key "invitations", "job_postings"
  add_foreign_key "invitations", "scout_templates"
  add_foreign_key "invitations", "users", column: "company_id"
  add_foreign_key "invitations", "users", column: "student_id"
  add_foreign_key "job_postings", "companies"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users", column: "receiver_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "scout_templates", "companies"
  add_foreign_key "selection_processes", "applications"
  add_foreign_key "student_tech_interests", "technologies"
  add_foreign_key "student_tech_interests", "users"
  add_foreign_key "tech_combinations", "technologies", column: "primary_tech_id"
  add_foreign_key "tech_combinations", "technologies", column: "secondary_tech_id"
  add_foreign_key "tech_search_logs", "users"
end
