# Technology seed data
technologies_data = [
  # Frontend Technologies
  {
    name: 'React',
    category: 'frontend',
    description: 'A JavaScript library for building user interfaces',
    official_url: 'https://reactjs.org',
    learning_difficulty: 2,
    market_demand_score: 9.5,
    popularity_score: 9.8
  },
  {
    name: 'Vue.js',
    category: 'frontend',
    description: 'The Progressive JavaScript Framework',
    official_url: 'https://vuejs.org',
    learning_difficulty: 2,
    market_demand_score: 8.0,
    popularity_score: 8.5
  },
  {
    name: 'Angular',
    category: 'frontend',
    description: 'Platform for building mobile and desktop web applications',
    official_url: 'https://angular.io',
    learning_difficulty: 3,
    market_demand_score: 7.5,
    popularity_score: 7.2
  },
  {
    name: 'Next.js',
    category: 'frontend',
    description: 'The React Framework for Production',
    official_url: 'https://nextjs.org',
    learning_difficulty: 3,
    market_demand_score: 9.0,
    popularity_score: 8.8
  },
  {
    name: 'TypeScript',
    category: 'frontend',
    description: 'JavaScript with syntax for types',
    official_url: 'https://www.typescriptlang.org',
    learning_difficulty: 2,
    market_demand_score: 9.2,
    popularity_score: 9.0
  },
  
  # Backend Technologies
  {
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    official_url: 'https://nodejs.org',
    learning_difficulty: 2,
    market_demand_score: 9.0,
    popularity_score: 9.2
  },
  {
    name: 'Python',
    category: 'backend',
    description: 'Programming language that lets you work quickly',
    official_url: 'https://www.python.org',
    learning_difficulty: 1,
    market_demand_score: 9.5,
    popularity_score: 9.7
  },
  {
    name: 'Ruby',
    category: 'backend',
    description: 'A dynamic, open source programming language',
    official_url: 'https://www.ruby-lang.org',
    learning_difficulty: 2,
    market_demand_score: 6.5,
    popularity_score: 6.8
  },
  {
    name: 'Ruby on Rails',
    category: 'backend',
    description: 'A server-side web application framework',
    official_url: 'https://rubyonrails.org',
    learning_difficulty: 3,
    market_demand_score: 6.0,
    popularity_score: 6.5
  },
  {
    name: 'Java',
    category: 'backend',
    description: 'Object-oriented programming language',
    official_url: 'https://www.oracle.com/java',
    learning_difficulty: 3,
    market_demand_score: 8.5,
    popularity_score: 8.2
  },
  {
    name: 'Spring Boot',
    category: 'backend',
    description: 'Spring Framework for microservices',
    official_url: 'https://spring.io/projects/spring-boot',
    learning_difficulty: 4,
    market_demand_score: 8.0,
    popularity_score: 7.8
  },
  {
    name: 'Go',
    category: 'backend',
    description: 'Open source programming language by Google',
    official_url: 'https://golang.org',
    learning_difficulty: 2,
    market_demand_score: 8.0,
    popularity_score: 7.5
  },
  
  # Database Technologies
  {
    name: 'PostgreSQL',
    category: 'database',
    description: 'Open source object-relational database system',
    official_url: 'https://www.postgresql.org',
    learning_difficulty: 3,
    market_demand_score: 8.5,
    popularity_score: 8.0
  },
  {
    name: 'MySQL',
    category: 'database',
    description: 'Open-source relational database management system',
    official_url: 'https://www.mysql.com',
    learning_difficulty: 2,
    market_demand_score: 8.0,
    popularity_score: 8.2
  },
  {
    name: 'MongoDB',
    category: 'database',
    description: 'Document database with scalability and flexibility',
    official_url: 'https://www.mongodb.com',
    learning_difficulty: 2,
    market_demand_score: 7.5,
    popularity_score: 7.8
  },
  {
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store',
    official_url: 'https://redis.io',
    learning_difficulty: 2,
    market_demand_score: 7.8,
    popularity_score: 7.5
  },
  
  # DevOps Technologies
  {
    name: 'Docker',
    category: 'devops',
    description: 'Platform for developing, shipping, and running applications',
    official_url: 'https://www.docker.com',
    learning_difficulty: 3,
    market_demand_score: 9.0,
    popularity_score: 8.8
  },
  {
    name: 'Kubernetes',
    category: 'devops',
    description: 'Open-source container orchestration system',
    official_url: 'https://kubernetes.io',
    learning_difficulty: 4,
    market_demand_score: 8.5,
    popularity_score: 8.0
  },
  {
    name: 'AWS',
    category: 'devops',
    description: 'Amazon Web Services cloud platform',
    official_url: 'https://aws.amazon.com',
    learning_difficulty: 4,
    market_demand_score: 9.5,
    popularity_score: 9.2
  },
  {
    name: 'GitHub Actions',
    category: 'devops',
    description: 'CI/CD platform integrated with GitHub',
    official_url: 'https://github.com/features/actions',
    learning_difficulty: 2,
    market_demand_score: 7.0,
    popularity_score: 7.5
  },
  
  # AI/ML Technologies
  {
    name: 'TensorFlow',
    category: 'ai_ml',
    description: 'End-to-end open source platform for machine learning',
    official_url: 'https://www.tensorflow.org',
    learning_difficulty: 4,
    market_demand_score: 8.5,
    popularity_score: 8.2
  },
  {
    name: 'PyTorch',
    category: 'ai_ml',
    description: 'Open source machine learning library',
    official_url: 'https://pytorch.org',
    learning_difficulty: 4,
    market_demand_score: 8.0,
    popularity_score: 8.5
  },
  
  # Mobile Technologies
  {
    name: 'React Native',
    category: 'mobile',
    description: 'Build native mobile apps using React',
    official_url: 'https://reactnative.dev',
    learning_difficulty: 3,
    market_demand_score: 7.5,
    popularity_score: 7.8
  },
  {
    name: 'Flutter',
    category: 'mobile',
    description: 'UI toolkit for building native applications',
    official_url: 'https://flutter.dev',
    learning_difficulty: 3,
    market_demand_score: 7.0,
    popularity_score: 7.2
  },
  
  # Testing Technologies
  {
    name: 'Jest',
    category: 'testing',
    description: 'JavaScript Testing Framework',
    official_url: 'https://jestjs.io',
    learning_difficulty: 2,
    market_demand_score: 6.5,
    popularity_score: 7.0
  },
  {
    name: 'RSpec',
    category: 'testing',
    description: 'Behaviour Driven Development for Ruby',
    official_url: 'https://rspec.info',
    learning_difficulty: 2,
    market_demand_score: 5.0,
    popularity_score: 5.5
  }
]

puts "Creating technologies..."
technologies_data.each do |tech_data|
  technology = Technology.find_or_initialize_by(name: tech_data[:name])
  technology.assign_attributes(tech_data)
  
  if technology.save
    puts "✓ Created technology: #{technology.name}"
  else
    puts "✗ Failed to create technology: #{tech_data[:name]} - #{technology.errors.full_messages.join(', ')}"
  end
end

puts "\nCreated #{Technology.count} technologies total."