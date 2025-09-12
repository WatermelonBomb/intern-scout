export interface Technology {
  id: number;
  name: string;
  category: string;
  description: string;
  official_url: string;
  logo_url?: string;
  learning_difficulty: number;
  market_demand_score: number;
  popularity_score: number;
  companies_using_count: number;
  interested_students_count: number;
}

export interface TechCombination {
  id: number;
  name: string;
  category: string;
  combination_type: string;
  popularity_score: number;
}

export interface TechSearchParams {
  required_tech: number[];
  preferred_tech: number[];
  excluded_tech: number[];
  search_mode: 'AND' | 'OR';
  categories: string[];
  company_size?: string;
  location?: string;
  min_match_score: number;
}

export interface CompanySearchResult {
  id: number;
  name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  match_score: number;
  matching_technologies: Technology[];
  tech_culture_score: number;
  open_source_contributions: number;
  tech_blog_url?: string;
  github_org_url?: string;
  main_technologies: Technology[];
  job_postings_count: number;
}

export interface SearchResponse {
  companies: CompanySearchResult[];
  search_summary: {
    total_results: number;
    search_params: TechSearchParams;
    technologies_searched: string[];
  };
}

export interface StudentTechInterest {
  id: number;
  technology: Technology;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skill_level_display: string;
  learning_priority: number;
  interest_type: 'want_to_learn' | 'currently_learning' | 'experienced_with' | 'expert_in';
  interest_type_display: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyTechStack {
  id: number;
  technology: Technology;
  usage_level: 'main' | 'sub' | 'experimental';
  usage_level_display: string;
  years_used: number;
  team_size?: number;
  project_example?: string;
  is_main_tech: boolean;
  created_at: string;
  updated_at: string;
}

export const TECH_CATEGORIES = [
  'frontend',
  'backend', 
  'database',
  'devops',
  'mobile',
  'ai_ml',
  'data_science',
  'testing',
  'design',
  'other'
] as const;

export type TechCategory = typeof TECH_CATEGORIES[number];

export const CATEGORY_LABELS: Record<TechCategory, string> = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  database: 'データベース',
  devops: 'DevOps',
  mobile: 'モバイル',
  ai_ml: 'AI/ML',
  data_science: 'データサイエンス',
  testing: 'テスト',
  design: 'デザイン',
  other: 'その他'
};

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: '未経験',
  intermediate: '初級',
  advanced: '中級',
  expert: '上級'
};