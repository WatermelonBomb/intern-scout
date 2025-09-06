class CreateCompanies < ActiveRecord::Migration[8.0]
  def change
    create_table :companies do |t|
      t.string :name
      t.string :industry
      t.text :description
      t.string :website
      t.string :location

      t.timestamps
    end
  end
end
