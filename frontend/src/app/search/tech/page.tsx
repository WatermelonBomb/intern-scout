'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  StarIcon,
  HeartIcon,
  XMarkIcon,
  CheckIcon,
  MinusIcon
} from '@heroicons/react/24/solid';
import { technologyAPI } from '@/lib/api/technology';
import type {
  Technology,
  TechSearchParams,
  CompanySearchResult,
  TechCategory
} from '@/lib/types/technology';
import { CATEGORY_LABELS } from '@/lib/types/technology';

export default function TechSearchPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Core states
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteCompanies, setFavoriteCompanies] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'match_score' | 'popularity'>('relevance');
  const [animateResults, setAnimateResults] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Search parameters
  const [searchConfig, setSearchConfig] = useState<TechSearchParams>({
    required_tech: [],
    preferred_tech: [],
    excluded_tech: [],
    search_mode: 'OR',
    categories: [],
    min_match_score: 50,
    experience_level: 'intermediate',
    company_size: 'any',
    remote_preference: 'any',
    salary_range: [0, 200000],
    work_culture: [],
    growth_potential: 50
  });

  // Get selected technologies
  const selectedTechnologies = useMemo(() => {
    const allSelected = [
      ...searchConfig.required_tech,
      ...searchConfig.preferred_tech,
      ...searchConfig.excluded_tech
    ];
    return technologies.filter(tech => allSelected.includes(tech.id));
  }, [technologies, searchConfig]);

  // Fetch technologies on mount
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const data = await technologyAPI.getTechnologies({ sort: 'popular' });
        setTechnologies(data.technologies);
      } catch (error) {
        console.error('Failed to fetch technologies:', error);
      }
    };

    fetchTechnologies();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Filter technologies based on category and search
  const filteredTechnologies = useMemo(() => {
    let filtered = technologies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tech => tech.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [technologies, selectedCategory, searchQuery]);

  // Handle technology selection
  const handleTechSelect = (tech: Technology, type: 'required' | 'preferred' | 'excluded') => {
    setSearchConfig(prev => {
      const newConfig = { ...prev };

      // Remove from all arrays first
      newConfig.required_tech = prev.required_tech.filter(id => id !== tech.id);
      newConfig.preferred_tech = prev.preferred_tech.filter(id => id !== tech.id);
      newConfig.excluded_tech = prev.excluded_tech.filter(id => id !== tech.id);

      // Add to the specified array
      switch (type) {
        case 'required':
          newConfig.required_tech.push(tech.id);
          break;
        case 'preferred':
          newConfig.preferred_tech.push(tech.id);
          break;
        case 'excluded':
          newConfig.excluded_tech.push(tech.id);
          break;
      }

      return newConfig;
    });
  };

  // Remove technology from selection
  const handleTechRemove = (techId: number) => {
    setSearchConfig(prev => ({
      ...prev,
      required_tech: prev.required_tech.filter(id => id !== techId),
      preferred_tech: prev.preferred_tech.filter(id => id !== techId),
      excluded_tech: prev.excluded_tech.filter(id => id !== techId)
    }));
  };

  // Perform search
  const handleSearch = async () => {
    if (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0) {
      return;
    }

    // Clear any existing timers
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setIsLoading(true);
    setAnimateResults(false);

    try {
      const data = await technologyAPI.searchCompanies(searchConfig);

      // Add slight delay for smooth animation
      searchTimeoutRef.current = setTimeout(() => {
        setSearchResults(data.companies);
        setAnimateResults(true);
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        searchTimeoutRef.current = null;
      }, 300);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 300);
    }
  };

  // Toggle favorite company
  const toggleFavorite = useCallback((companyId: number) => {
    setFavoriteCompanies(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(companyId)) {
        newFavorites.delete(companyId);
      } else {
        newFavorites.add(companyId);
      }
      return newFavorites;
    });
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleToggleFiltersKey = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleFilters();
    }
  }, [handleToggleFilters]);

  const handleToggleAdvancedFilters = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowAdvancedFilters(prev => !prev);
  }, []);

  // Get technology type (required/preferred/excluded)
  const getTechType = (techId: number): 'required' | 'preferred' | 'excluded' | null => {
    if (searchConfig.required_tech.includes(techId)) return 'required';
    if (searchConfig.preferred_tech.includes(techId)) return 'preferred';
    if (searchConfig.excluded_tech.includes(techId)) return 'excluded';
    return null;
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(technologies.map(tech => tech.category))];
    return cats.sort();
  }, [technologies]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Simple Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="absolute inset-0 opacity-20 bg-dot-pattern"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            技術スタック検索
          </h1>
          <p className="text-base text-neutral-600 max-w-lg mx-auto">
            理想の技術スタックで企業を見つけよう
          </p>
          <div className="flex items-center justify-center mt-6 space-x-8">
            <div className="flex items-center text-sm text-neutral-500">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              {searchResults.length}+ 企業
            </div>
            <div className="flex items-center text-sm text-neutral-500">
              <BoltIcon className="h-4 w-4 mr-1" />
              {technologies.length}+ 技術
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Technology Selection */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Technology Selection */}
              <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                    <BoltIcon className="h-5 w-5 mr-2 text-primary-600" />
                    技術を選択
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-xs font-medium">
                      {selectedTechnologies.length}個
                    </span>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    <FunnelIcon className="inline h-4 w-4 mr-2" />
                    カテゴリフィルター
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-200 appearance-none cursor-pointer"
                    >
                      <option value="all">🌐 すべてのカテゴリ</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {CATEGORY_LABELS[category as TechCategory] || category}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* Simple Search Input */}
                <div className="mb-4 relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="技術名やフレームワークで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-primary-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Technology List */}
                <div className="max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredTechnologies.map((tech, index) => {
                      const type = getTechType(tech.id);
                      const isSelected = type !== null;

                      return (
                        <div
                          key={tech.id}
                          className={`p-3 rounded-lg border ${
                            isSelected
                              ? 'bg-primary-50 border-primary-200'
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                                  {CATEGORY_LABELS[tech.category as TechCategory] || tech.category}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <StarIcon className="h-3 w-3 text-yellow-400" />
                                  <span className="text-xs font-medium text-neutral-600">
                                    {tech.popularity_score}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h4 className="font-medium text-neutral-900 text-sm">
                              {tech.name}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                              {tech.description}
                            </p>
                          </div>

                          <div className="mt-3">
                            {!isSelected ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleTechSelect(tech, 'required')}
                                  className="flex-1 px-2 py-1 rounded bg-error-100 text-error-700 text-xs hover:bg-error-200"
                                >
                                  必須
                                </button>
                                <button
                                  onClick={() => handleTechSelect(tech, 'preferred')}
                                  className="flex-1 px-2 py-1 rounded bg-success-100 text-success-700 text-xs hover:bg-success-200"
                                >
                                  歓迎
                                </button>
                                <button
                                  onClick={() => handleTechSelect(tech, 'excluded')}
                                  className="flex-1 px-2 py-1 rounded bg-neutral-100 text-neutral-700 text-xs hover:bg-neutral-200"
                                >
                                  除外
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  type === 'required'
                                    ? 'bg-error-100 text-error-800'
                                    : type === 'preferred'
                                    ? 'bg-success-100 text-success-800'
                                    : 'bg-neutral-100 text-neutral-800'
                                }`}>
                                  {type === 'required' ? '必須' : type === 'preferred' ? '歓迎' : '除外'}
                                </span>
                                <button
                                  onClick={() => handleTechRemove(tech.id)}
                                  className="ml-2 p-1 rounded hover:bg-error-100 text-error-500 hover:text-error-700"
                                  title="選択を解除"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredTechnologies.length === 0 && (
                    <div className="text-center py-12">
                      <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
                        <MagnifyingGlassIcon />
                      </div>
                      <h3 className="text-sm font-medium text-neutral-900 mb-1">技術が見つかりません</h3>
                      <p className="text-xs text-neutral-500">検索条件を変更してみてください</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Technologies */}
              {selectedTechnologies.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-neutral-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-neutral-900 flex items-center">
                      <CheckIcon className="h-4 w-4 mr-2 text-success-600" />
                      選択済み技術
                    </h4>
                    <button
                      onClick={() => {
                        setSearchConfig({
                          required_tech: [],
                          preferred_tech: [],
                          excluded_tech: [],
                          search_mode: 'OR',
                          categories: [],
                          min_match_score: 50,
                          experience_level: 'intermediate',
                          company_size: 'any',
                          remote_preference: 'any',
                          salary_range: [0, 200000],
                          work_culture: [],
                          growth_potential: 50
                        });
                      }}
                      className="text-xs text-neutral-500 hover:text-error-600 flex items-center"
                    >
                      <XMarkIcon className="h-3 w-3 mr-1" />
                      すべてクリア
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Required Technologies */}
                    {searchConfig.required_tech.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-error-700 mb-1 flex items-center">
                          <FireIcon className="h-3 w-3 mr-1" />
                          必須技術
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {technologies.filter(tech => searchConfig.required_tech.includes(tech.id)).map(tech => (
                            <span key={`req-${tech.id}`} className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-error-100 text-error-800">
                              {tech.name}
                              <button
                                onClick={() => handleTechRemove(tech.id)}
                                className="ml-1 hover:text-error-600"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferred Technologies */}
                    {searchConfig.preferred_tech.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-success-700 mb-1 flex items-center">
                          <SparklesIcon className="h-3 w-3 mr-1" />
                          歓迎技術
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {technologies.filter(tech => searchConfig.preferred_tech.includes(tech.id)).map(tech => (
                            <span key={`pref-${tech.id}`} className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-success-100 text-success-800">
                              {tech.name}
                              <button
                                onClick={() => handleTechRemove(tech.id)}
                                className="ml-1 hover:text-success-600"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Excluded Technologies */}
                    {searchConfig.excluded_tech.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-neutral-700 mb-1 flex items-center">
                          <MinusIcon className="h-3 w-3 mr-1" />
                          除外技術
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {technologies.filter(tech => searchConfig.excluded_tech.includes(tech.id)).map(tech => (
                            <span key={`excl-${tech.id}`} className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-neutral-100 text-neutral-800">
                              {tech.name}
                              <button
                                onClick={() => handleTechRemove(tech.id)}
                                className="ml-1 hover:text-neutral-600"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Options */}
              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleToggleFilters}
                  onKeyDown={handleToggleFiltersKey}
                  className="flex items-center justify-between w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <h4 className="text-base font-semibold text-neutral-900 flex items-center">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                    検索オプション
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleToggleAdvancedFilters}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        showAdvancedFilters
                          ? 'bg-primary-500 text-white'
                          : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      }`}
                    >
                      高度なフィルタ
                    </button>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-neutral-400 transform transition-transform ${
                        showFilters ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        <ChartBarIcon className="h-4 w-4 mr-2 inline" />
                        検索モード
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSearchConfig(prev => ({ ...prev, search_mode: 'OR' }))}
                          className={`p-2 rounded text-sm font-medium border ${
                            searchConfig.search_mode === 'OR'
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          いずれか (OR)
                        </button>
                        <button
                          onClick={() => setSearchConfig(prev => ({ ...prev, search_mode: 'AND' }))}
                          className={`p-2 rounded text-sm font-medium border ${
                            searchConfig.search_mode === 'AND'
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          すべて (AND)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center justify-between">
                        <span className="flex items-center">
                          <TrophyIcon className="h-4 w-4 mr-2" />
                          最低マッチスコア
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-bold">
                          {searchConfig.min_match_score}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={searchConfig.min_match_score}
                        onChange={(e) => setSearchConfig(prev => ({
                          ...prev,
                          min_match_score: parseInt(e.target.value)
                        }))}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1 text-xs text-neutral-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isLoading || (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0)}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  isLoading || (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0)
                    ? 'bg-neutral-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>検索中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>企業を検索</span>
                    {selectedTechnologies.length > 0 && (
                      <span className="px-2 py-1 bg-white/20 rounded text-xs">
                        {selectedTechnologies.length}個
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Search Results */}
          <div className="xl:col-span-2" ref={resultsRef}>
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="bg-white rounded-lg p-4 border border-neutral-200 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
                        検索結果
                        <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                          {searchResults.length}件
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* View Mode Toggle */}
                      <div className="flex bg-neutral-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            viewMode === 'grid'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          グリッド
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            viewMode === 'list'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          リスト
                        </button>
                      </div>

                      {/* Sort Options */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'relevance' | 'match_score' | 'popularity')}
                          className="px-3 py-1 bg-white border border-neutral-200 rounded text-sm font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:border-primary-500 cursor-pointer appearance-none pr-8"
                        >
                          <option value="relevance">関連度順</option>
                          <option value="match_score">マッチ度順</option>
                          <option value="popularity">人気順</option>
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Cards */}
                <div className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                    : 'space-y-6'
                }`}>
                  {searchResults.map((company, index) => (
                    <div
                      key={company.id}
                      className={`bg-white rounded-lg p-4 border border-neutral-200 hover:border-neutral-300 transition-colors ${
                        animateResults ? 'animate-fade-in' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Company Header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                              <h4 className="text-lg font-semibold text-neutral-900">
                                {company.name}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="px-2 py-1 bg-success-100 text-success-800 rounded text-xs font-medium">
                                マッチ: {company.match_score}%
                              </span>
                              <div className="flex items-center text-neutral-500 text-xs">
                                <UserGroupIcon className="h-3 w-3 mr-1" />
                                {company.job_postings_count}求人
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFavorite(company.id)}
                              className={`p-2 rounded ${favoriteCompanies.has(company.id) ? 'text-error-600' : 'text-neutral-400 hover:text-error-600'}`}
                            >
                              <HeartIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/companies/${company.id}`)}
                              className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                            >
                              詳細
                            </button>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                          <span>{company.industry}</span>
                          <span>•</span>
                          <span>{company.location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                          {company.description}
                        </p>

                        {/* Technology Tags */}
                        <div className="space-y-2">
                          {/* Matching Technologies */}
                          {company.matching_technologies.length > 0 && (
                            <div>
                              <h6 className="text-xs font-medium text-success-700 mb-1">マッチした技術</h6>
                              <div className="flex flex-wrap gap-1">
                                {company.matching_technologies.slice(0, 4).map((tech, techIndex) => (
                                  <span
                                    key={`company-${company.id}-matching-${tech.id}-${techIndex}`}
                                    className="px-2 py-1 bg-success-100 text-success-800 rounded text-xs"
                                  >
                                    {tech.name}
                                  </span>
                                ))}
                                {company.matching_technologies.length > 4 && (
                                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                                    +{company.matching_technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Main Technologies */}
                          {company.main_technologies.length > 0 && (
                            <div>
                              <h6 className="text-xs font-medium text-primary-700 mb-1">主要技術</h6>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(company.main_technologies.map(tech => tech.id)))
                                  .slice(0, 3)
                                  .map((uniqueId, techIndex) => {
                                    const tech = company.main_technologies.find(t => t.id === uniqueId);
                                    return (
                                      <span
                                        key={`company-${company.id}-main-${uniqueId}-${techIndex}`}
                                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
                                      >
                                        {tech?.name}
                                      </span>
                                    );
                                  })
                                }
                                {company.main_technologies.length > 3 && (
                                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
                                    +{company.main_technologies.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 border border-neutral-200 text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                      <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">企業を発見しよう</h3>
                  <p className="text-neutral-600 mb-4">
                    左側の技術選択パネルからお好みの技術を選んで、
                    <br />
                    あなたにピッタリの企業を見つけましょう。
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-center p-2 bg-error-50 rounded border border-error-200">
                      <FireIcon className="h-3 w-3 mr-1 text-error-600" />
                      <span className="text-sm text-neutral-700">必須技術</span>
                    </div>
                    <div className="flex items-center justify-center p-2 bg-success-50 rounded border border-success-200">
                      <SparklesIcon className="h-3 w-3 mr-1 text-success-600" />
                      <span className="text-sm text-neutral-700">歓迎技術</span>
                    </div>
                    <div className="flex items-center justify-center p-2 bg-neutral-50 rounded border border-neutral-200">
                      <MinusIcon className="h-3 w-3 mr-1 text-neutral-500" />
                      <span className="text-sm text-neutral-700">除外技術</span>
                    </div>
                    <div className="flex items-center justify-center p-2 bg-secondary-50 rounded border border-secondary-200">
                      <AdjustmentsHorizontalIcon className="h-3 w-3 mr-1 text-secondary-600" />
                      <span className="text-sm text-neutral-700">高精度検索</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
