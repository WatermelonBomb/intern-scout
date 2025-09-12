# Tech combinations seed data
combinations_data = [
  # Frontend combinations
  { primary: 'React', secondary: 'TypeScript', type: 'common', score: 95.0 },
  { primary: 'React', secondary: 'Next.js', type: 'framework_library', score: 85.0 },
  { primary: 'Vue.js', secondary: 'TypeScript', type: 'common', score: 70.0 },
  { primary: 'Angular', secondary: 'TypeScript', type: 'framework_library', score: 98.0 },
  
  # Backend + Database combinations
  { primary: 'Node.js', secondary: 'PostgreSQL', type: 'backend_database', score: 80.0 },
  { primary: 'Node.js', secondary: 'MongoDB', type: 'backend_database', score: 75.0 },
  { primary: 'Ruby on Rails', secondary: 'PostgreSQL', type: 'backend_database', score: 90.0 },
  { primary: 'Python', secondary: 'PostgreSQL', type: 'backend_database', score: 85.0 },
  { primary: 'Java', secondary: 'MySQL', type: 'backend_database', score: 80.0 },
  { primary: 'Spring Boot', secondary: 'PostgreSQL', type: 'backend_database', score: 85.0 },
  
  # Frontend + Backend combinations
  { primary: 'React', secondary: 'Node.js', type: 'frontend_backend', score: 90.0 },
  { primary: 'Vue.js', secondary: 'Node.js', type: 'frontend_backend', score: 75.0 },
  { primary: 'Angular', secondary: 'Java', type: 'frontend_backend', score: 70.0 },
  { primary: 'Next.js', secondary: 'Node.js', type: 'frontend_backend', score: 95.0 },
  
  # DevOps combinations
  { primary: 'Docker', secondary: 'Kubernetes', type: 'common', score: 85.0 },
  { primary: 'AWS', secondary: 'Docker', type: 'common', score: 80.0 },
  { primary: 'GitHub Actions', secondary: 'Docker', type: 'common', score: 70.0 },
  
  # AI/ML combinations
  { primary: 'Python', secondary: 'TensorFlow', type: 'language_framework', score: 90.0 },
  { primary: 'Python', secondary: 'PyTorch', type: 'language_framework', score: 88.0 },
  
  # Mobile combinations
  { primary: 'React', secondary: 'React Native', type: 'framework_library', score: 85.0 },
  
  # Testing combinations
  { primary: 'Node.js', secondary: 'Jest', type: 'common', score: 80.0 },
  { primary: 'Ruby on Rails', secondary: 'RSpec', type: 'framework_library', score: 90.0 },
  
  # Cache combinations
  { primary: 'Node.js', secondary: 'Redis', type: 'common', score: 70.0 },
  { primary: 'Ruby on Rails', secondary: 'Redis', type: 'common', score: 75.0 },
  { primary: 'Python', secondary: 'Redis', type: 'common', score: 70.0 }
]

puts "Creating technology combinations..."
combinations_data.each do |combo_data|
  primary_tech = Technology.find_by(name: combo_data[:primary])
  secondary_tech = Technology.find_by(name: combo_data[:secondary])
  
  unless primary_tech && secondary_tech
    puts "✗ Skipping combination: #{combo_data[:primary]} + #{combo_data[:secondary]} (technologies not found)"
    next
  end
  
  combination = TechCombination.find_or_initialize_by(
    primary_tech: primary_tech,
    secondary_tech: secondary_tech
  )
  
  combination.assign_attributes(
    combination_type: combo_data[:type],
    popularity_score: combo_data[:score]
  )
  
  if combination.save
    puts "✓ Created combination: #{primary_tech.name} + #{secondary_tech.name}"
  else
    puts "✗ Failed to create combination: #{combo_data[:primary]} + #{combo_data[:secondary]} - #{combination.errors.full_messages.join(', ')}"
  end
end

puts "\nCreated #{TechCombination.count} technology combinations total."