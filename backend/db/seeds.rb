# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "🌱 Starting database seeding..."

# Load technology data
load Rails.root.join('db', 'seeds', 'technologies.rb')

# Load technology combinations data  
load Rails.root.join('db', 'seeds', 'tech_combinations.rb')

# Demo accounts for local development / preview
student = User.find_or_initialize_by(email: 'test@example.com')
student.update!(
  password: 'password123',
  password_confirmation: 'password123',
  first_name: student.first_name.presence || 'Test',
  last_name: student.last_name.presence || 'Student',
  user_type: 'student',
  university: student.university.presence || 'Intern University',
  graduation_year: student.graduation_year || Date.current.year + 1,
  bio: student.bio.presence || 'Sample student account for demo login.',
  skills: student.skills.presence || 'React, Ruby, SQL'
)

company_user = User.find_or_initialize_by(email: 'company@example.com')
company_user.update!(
  password: 'password123',
  password_confirmation: 'password123',
  first_name: company_user.first_name.presence || 'Demo',
  last_name: company_user.last_name.presence || 'Company',
  user_type: 'company'
)

company = company_user.companies.find_or_initialize_by(name: 'InternScout Demo Inc.')
company.update!(
  industry: company.industry.presence || 'Technology',
  description: company.description.presence || 'Demo company account for showcasing the platform.',
  website: company.website.presence || 'https://example.com',
  location: company.location.presence || 'Tokyo, Japan'
)

puts "✅ Demo accounts ready:"
puts "   Student  -> test@example.com / password123"
puts "   Company  -> company@example.com / password123"

puts "🌱 Database seeding completed!"
