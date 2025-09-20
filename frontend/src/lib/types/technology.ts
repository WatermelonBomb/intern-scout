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
  experience_level?: 'beginner' | 'intermediate' | 'expert';
  remote_preference?: 'any' | 'remote' | 'hybrid';
  salary_range?: [number, number];
  work_culture?: string[];
  growth_potential?: number;
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

const CATEGORY_LABEL_MAP = {
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  database: 'データベース',
  devops: 'DevOps',
  mobile: 'モバイル',
  ai_ml: 'AI/ML',
  data_science: 'データサイエンス',
  testing: 'テスト',
  design: 'デザイン',
  language: 'プログラミング言語',
  cloud: 'クラウド',
  security: 'セキュリティ',
  infrastructure: 'インフラ',
  analytics: 'アナリティクス',
  qa: 'QA',
  tooling: 'ツール',
  product: 'プロダクト',
  other: 'その他'
} as const;

export type TechCategory = keyof typeof CATEGORY_LABEL_MAP;

export const TECH_CATEGORIES = Object.keys(CATEGORY_LABEL_MAP) as TechCategory[];

export const CATEGORY_LABELS: Record<TechCategory, string> = CATEGORY_LABEL_MAP;

type CategoryTheme = {
  badge: string;
  mutedBadge: string;
  accent: string;
  border: string;
};

const CATEGORY_THEME_MAP: Record<TechCategory, CategoryTheme> = {
  frontend: {
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    mutedBadge: 'bg-blue-100/60 text-blue-800',
    accent: 'text-blue-600',
    border: 'border-blue-100'
  },
  backend: {
    badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-100',
    mutedBadge: 'bg-purple-100/60 text-purple-800',
    accent: 'text-purple-600',
    border: 'border-purple-100'
  },
  database: {
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    mutedBadge: 'bg-amber-100/60 text-amber-800',
    accent: 'text-amber-600',
    border: 'border-amber-100'
  },
  devops: {
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    mutedBadge: 'bg-emerald-100/60 text-emerald-800',
    accent: 'text-emerald-600',
    border: 'border-emerald-100'
  },
  mobile: {
    badge: 'bg-pink-50 text-pink-700 ring-1 ring-pink-100',
    mutedBadge: 'bg-pink-100/60 text-pink-800',
    accent: 'text-pink-600',
    border: 'border-pink-100'
  },
  ai_ml: {
    badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
    mutedBadge: 'bg-indigo-100/60 text-indigo-800',
    accent: 'text-indigo-600',
    border: 'border-indigo-100'
  },
  data_science: {
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
    mutedBadge: 'bg-sky-100/60 text-sky-800',
    accent: 'text-sky-600',
    border: 'border-sky-100'
  },
  testing: {
    badge: 'bg-lime-50 text-lime-700 ring-1 ring-lime-100',
    mutedBadge: 'bg-lime-100/60 text-lime-800',
    accent: 'text-lime-600',
    border: 'border-lime-100'
  },
  design: {
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    mutedBadge: 'bg-rose-100/60 text-rose-800',
    accent: 'text-rose-600',
    border: 'border-rose-100'
  },
  language: {
    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100',
    mutedBadge: 'bg-cyan-100/60 text-cyan-800',
    accent: 'text-cyan-600',
    border: 'border-cyan-100'
  },
  cloud: {
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    mutedBadge: 'bg-slate-200/60 text-slate-800',
    accent: 'text-slate-700',
    border: 'border-slate-200'
  },
  security: {
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    mutedBadge: 'bg-red-100/60 text-red-800',
    accent: 'text-red-600',
    border: 'border-red-100'
  },
  infrastructure: {
    badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
    mutedBadge: 'bg-orange-100/60 text-orange-800',
    accent: 'text-orange-600',
    border: 'border-orange-100'
  },
  analytics: {
    badge: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100',
    mutedBadge: 'bg-fuchsia-100/60 text-fuchsia-800',
    accent: 'text-fuchsia-600',
    border: 'border-fuchsia-100'
  },
  qa: {
    badge: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100',
    mutedBadge: 'bg-yellow-100/60 text-yellow-800',
    accent: 'text-yellow-600',
    border: 'border-yellow-100'
  },
  tooling: {
    badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-100',
    mutedBadge: 'bg-teal-100/60 text-teal-800',
    accent: 'text-teal-600',
    border: 'border-teal-100'
  },
  product: {
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    mutedBadge: 'bg-emerald-100/60 text-emerald-800',
    accent: 'text-emerald-600',
    border: 'border-emerald-100'
  },
  other: {
    badge: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
    mutedBadge: 'bg-gray-200/60 text-gray-800',
    accent: 'text-gray-600',
    border: 'border-gray-200'
  }
};

const DEFAULT_THEME: CategoryTheme = {
  badge: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  mutedBadge: 'bg-gray-100 text-gray-700',
  accent: 'text-gray-600',
  border: 'border-gray-200'
};

export const getCategoryTheme = (category: string): CategoryTheme =>
  CATEGORY_THEME_MAP[category as TechCategory] ?? DEFAULT_THEME;

export const getCategoryLabel = (category: string): string => {
  const label = CATEGORY_LABEL_MAP[category as TechCategory];
  if (label) {
    return label;
  }

  // Convert unknown categories like "data_platform" to "Data Platform"
  return category
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: '未経験',
  intermediate: '初級',
  advanced: '中級',
  expert: '上級'
};
