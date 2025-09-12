# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Starting database seeding..."

# Load technology data
load Rails.root.join('db', 'seeds', 'technologies.rb')

# Load technology combinations data  
load Rails.root.join('db', 'seeds', 'tech_combinations.rb')

puts "🌱 Database seeding completed!"
