class CreateJobPostings < ActiveRecord::Migration[8.0]
  def change
    create_table :job_postings do |t|
      t.references :company, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.text :requirements
      t.string :location
      t.string :salary_range
      t.string :employment_type
      t.date :deadline

      t.timestamps
    end
  end
end
