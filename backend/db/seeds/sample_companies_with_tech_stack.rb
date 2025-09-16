# Sample companies with tech stacks for testing

puts "Creating sample companies with tech stacks..."

# Create test company users
company_users = [
  {
    email: 'tech@example1.com',
    password: 'password123',
    first_name: 'Tech',
    last_name: 'Company1',
    user_type: 'company'
  },
  {
    email: 'tech@example2.com', 
    password: 'password123',
    first_name: 'Tech',
    last_name: 'Company2',
    user_type: 'company'
  },
  {
    email: 'tech@example3.com',
    password: 'password123', 
    first_name: 'Tech',
    last_name: 'Company3',
    user_type: 'company'
  }
]

users = []
company_users.each do |user_data|
  user = User.find_or_initialize_by(email: user_data[:email])
  user.assign_attributes(user_data)
  user.password = user_data[:password]
  
  if user.save
    users << user
    puts "✓ Created company user: #{user.email}"
  else
    puts "✗ Failed to create user: #{user_data[:email]} - #{user.errors.full_messages.join(', ')}"
  end
end

# Create sample companies
companies_data = [
  {
    name: 'Tech Innovations Inc.',
    industry: 'テクノロジー',
    description: 'AIとクラウド技術を活用した革新的なソリューションを提供しています。React、Python、AWSを使用してスケーラブルなWebアプリケーションを開発。',
    website: 'https://tech-innovations.com',
    location: '東京',
    tech_culture_score: 9.0,
    open_source_contributions: 15,
    tech_blog_url: 'https://tech-innovations.com/blog',
    github_org_url: 'https://github.com/tech-innovations'
  },
  {
    name: 'DataFlow Solutions',
    industry: 'データサイエンス',
    description: 'ビッグデータ分析とAIソリューションを提供する企業です。Python、PostgreSQL、機械学習技術を駆使してデータドリブンな意思決定をサポート。',
    website: 'https://dataflow.com',
    location: '大阪',
    tech_culture_score: 8.5,
    open_source_contributions: 8,
    tech_blog_url: 'https://dataflow.com/tech'
  },
  {
    name: 'Mobile First Co.',
    industry: 'モバイルアプリ開発',
    description: 'iOS、Android向けのモバイルアプリケーション開発を専門とする会社。React Native、Flutter、Node.jsを使用してクロスプラットフォーム開発。',
    website: 'https://mobilefirst.com',
    location: '福岡',
    tech_culture_score: 7.8,
    open_source_contributions: 5
  }
]

companies = []
companies_data.each_with_index do |company_data, index|
  next if users[index].nil?
  
  company = Company.find_or_initialize_by(user: users[index])
  company.assign_attributes(company_data.merge(tech_stack_last_updated: Time.current))
  
  if company.save
    companies << company
    puts "✓ Created company: #{company.name}"
  else
    puts "✗ Failed to create company: #{company_data[:name]} - #{company.errors.full_messages.join(', ')}"
  end
end

# Create tech stacks for companies
tech_stacks_data = [
  # Tech Innovations Inc. - React, Python, AWS focused
  {
    company_index: 0,
    technologies: [
      { name: 'React', usage_level: 'main', years_used: 3, team_size: 8, is_main_tech: true },
      { name: 'TypeScript', usage_level: 'main', years_used: 2, team_size: 8, is_main_tech: true },
      { name: 'Next.js', usage_level: 'main', years_used: 2, team_size: 5, is_main_tech: false },
      { name: 'Python', usage_level: 'main', years_used: 4, team_size: 6, is_main_tech: true },
      { name: 'PostgreSQL', usage_level: 'main', years_used: 3, team_size: 4, is_main_tech: false },
      { name: 'AWS', usage_level: 'main', years_used: 3, team_size: 3, is_main_tech: true },
      { name: 'Docker', usage_level: 'main', years_used: 2, team_size: 4, is_main_tech: false },
      { name: 'Node.js', usage_level: 'sub', years_used: 1, team_size: 3, is_main_tech: false }
    ]
  },
  # DataFlow Solutions - Python, Data Science focused
  {
    company_index: 1,
    technologies: [
      { name: 'Python', usage_level: 'main', years_used: 5, team_size: 12, is_main_tech: true },
      { name: 'PostgreSQL', usage_level: 'main', years_used: 4, team_size: 6, is_main_tech: true },
      { name: 'TensorFlow', usage_level: 'main', years_used: 3, team_size: 8, is_main_tech: true },
      { name: 'PyTorch', usage_level: 'main', years_used: 2, team_size: 5, is_main_tech: false },
      { name: 'Docker', usage_level: 'main', years_used: 3, team_size: 4, is_main_tech: false },
      { name: 'AWS', usage_level: 'sub', years_used: 2, team_size: 3, is_main_tech: false },
      { name: 'React', usage_level: 'sub', years_used: 1, team_size: 3, is_main_tech: false }
    ]
  },
  # Mobile First Co. - Mobile development focused
  {
    company_index: 2,
    technologies: [
      { name: 'React Native', usage_level: 'main', years_used: 4, team_size: 10, is_main_tech: true },
      { name: 'Flutter', usage_level: 'main', years_used: 2, team_size: 6, is_main_tech: true },
      { name: 'Node.js', usage_level: 'main', years_used: 3, team_size: 8, is_main_tech: true },
      { name: 'React', usage_level: 'main', years_used: 3, team_size: 7, is_main_tech: false },
      { name: 'TypeScript', usage_level: 'main', years_used: 2, team_size: 8, is_main_tech: false },
      { name: 'MongoDB', usage_level: 'main', years_used: 2, team_size: 4, is_main_tech: false },
      { name: 'AWS', usage_level: 'sub', years_used: 1, team_size: 2, is_main_tech: false }
    ]
  }
]

tech_stacks_data.each do |stack_data|
  company = companies[stack_data[:company_index]]
  next unless company
  
  stack_data[:technologies].each do |tech_data|
    technology = Technology.find_by(name: tech_data[:name])
    next unless technology
    
    tech_stack = CompanyTechStack.find_or_initialize_by(
      company: company,
      technology: technology
    )
    
    tech_stack.assign_attributes(
      usage_level: tech_data[:usage_level],
      years_used: tech_data[:years_used],
      team_size: tech_data[:team_size],
      is_main_tech: tech_data[:is_main_tech],
      project_example: "#{company.name}での#{technology.name}を使用したプロジェクト"
    )
    
    if tech_stack.save
      puts "✓ Added #{technology.name} to #{company.name}"
    else
      puts "✗ Failed to add #{tech_data[:name]} to #{company.name}: #{tech_stack.errors.full_messages.join(', ')}"
    end
  end
end

# Create sample job postings with tech requirements
job_postings_data = [
  {
    company_index: 0,
    title: 'フロントエンドエンジニア（React）',
    description: 'Reactを使用したWebアプリケーションの開発。TypeScriptでの開発経験を活かして、ユーザーフレンドリーなインターフェースを構築してください。',
    requirements: 'React 2年以上、TypeScript経験、チーム開発経験',
    location: '東京（リモート可）',
    salary_range: '400-700万円',
    employment_type: 'internship',
    deadline: 1.month.from_now.to_date,
    required_tech_ids: [1, 5], # React, TypeScript
    preferred_tech_ids: [4, 6], # Next.js, Node.js
    tech_learning_opportunities: 'AWSクラウド技術、最新のReact開発手法、アジャイル開発プロセス'
  },
  {
    company_index: 1,
    title: 'データサイエンティスト',
    description: 'Pythonを使用した機械学習モデルの開発と運用。TensorFlowやPyTorchを活用してAIソリューションを構築してください。',
    requirements: 'Python 3年以上、機械学習経験、統計学の知識',
    location: '大阪（ハイブリッド）',
    salary_range: '500-800万円',
    employment_type: 'internship',
    deadline: 2.months.from_now.to_date,
    required_tech_ids: [7, 21], # Python, TensorFlow
    preferred_tech_ids: [22, 13], # PyTorch, PostgreSQL
    tech_learning_opportunities: '最新のAI/ML技術、大規模データ処理、クラウドMLサービス'
  },
  {
    company_index: 2,
    title: 'モバイルアプリ開発エンジニア',
    description: 'React NativeまたはFlutterを使用したクロスプラットフォームアプリの開発。ユーザー体験を重視したモバイルアプリを作成してください。',
    requirements: 'モバイル開発経験2年以上、React NativeまたはFlutter経験',
    location: '福岡（フルリモート可）',
    salary_range: '350-600万円',
    employment_type: 'internship',
    deadline: 6.weeks.from_now.to_date,
    required_tech_ids: [23], # React Native
    preferred_tech_ids: [24, 6, 5], # Flutter, Node.js, TypeScript
    tech_learning_opportunities: 'ネイティブアプリ開発、UX/UIデザイン、アプリストア公開プロセス'
  }
]

job_postings_data.each do |job_data|
  company = companies[job_data[:company_index]]
  next unless company
  
  job_posting = JobPosting.find_or_initialize_by(
    company: company,
    title: job_data[:title]
  )
  
  job_posting.assign_attributes(job_data.except(:company_index))
  
  if job_posting.save
    puts "✓ Created job posting: #{job_posting.title} at #{company.name}"
  else
    puts "✗ Failed to create job posting: #{job_data[:title]} - #{job_posting.errors.full_messages.join(', ')}"
  end
end

puts "\nSample data creation completed!"
puts "Created #{companies.size} companies with tech stacks"
puts "You can now search for companies using technologies like React, Python, AWS, etc."