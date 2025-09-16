'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, StarIcon } from '@heroicons/react/20/solid';
import { technologyAPI } from '@/lib/api/technology';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  Technology, 
  TechSearchParams, 
  CompanySearchResult, 
  TechCategory,
  CATEGORY_LABELS 
} from '@/lib/types/technology';
import { CATEGORY_LABELS } from '@/lib/types/technology';

export default function TechSearchPage() {
  // const { user } = useAuth(); // TODO: Add authentication check
  const router = useRouter();
  // const searchParams = useSearchParams(); // TODO: Use for URL state management
  
  // States
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search parameters
  const [searchConfig, setSearchConfig] = useState<TechSearchParams>({
    required_tech: [],
    preferred_tech: [],
    excluded_tech: [],
    search_mode: 'OR',
    categories: [],
    min_match_score: 50
  });

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

  // Get selected technologies
  const selectedTechnologies = useMemo(() => {
    const allSelected = [
      ...searchConfig.required_tech,
      ...searchConfig.preferred_tech,
      ...searchConfig.excluded_tech
    ];
    return technologies.filter(tech => allSelected.includes(tech.id));
  }, [technologies, searchConfig]);

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

    setIsLoading(true);
    
    try {
      const data = await technologyAPI.searchCompanies(searchConfig);
      setSearchResults(data.companies);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>技術スタック検索</h1>
          <p style={{ marginTop: '8px', color: '#4b5563' }}>
            使いたい技術から企業を検索し、あなたにマッチする企業を見つけましょう
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Left Panel - Technology Selection */}
          <div>
            <div style={{ position: 'sticky', top: '32px' }}>
              {/* Search Technologies */}
              <div style={{ borderRadius: '8px', backgroundColor: 'white', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>技術を選択</h3>
                
                {/* Category Filter */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    カテゴリ
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      padding: '8px 12px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="all">すべて</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {CATEGORY_LABELS[category as TechCategory] || category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <MagnifyingGlassIcon style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      height: '16px', 
                      width: '16px', 
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      placeholder="技術名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        paddingLeft: '40px',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Technology List */}
                <div style={{ maxHeight: '256px', overflowY: 'auto' }}>
                  {filteredTechnologies.map(tech => {
                    const type = getTechType(tech.id);
                    const isSelected = type !== null;
                    
                    return (
                      <div key={tech.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af'
                          }}>
                            {CATEGORY_LABELS[tech.category as TechCategory] || tech.category}
                          </span>
                          <span style={{ fontSize: '14px', color: '#111827' }}>{tech.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <StarIcon style={{ height: '12px', width: '12px', color: '#fbbf24' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {tech.popularity_score}
                            </span>
                          </div>
                        </div>
                        
                        {!isSelected ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleTechSelect(tech, 'required')}
                              style={{
                                borderRadius: '4px',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="必須技術として追加"
                            >
                              必須
                            </button>
                            <button
                              onClick={() => handleTechSelect(tech, 'preferred')}
                              style={{
                                borderRadius: '4px',
                                backgroundColor: '#f0fdf4',
                                color: '#15803d',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="歓迎技術として追加"
                            >
                              歓迎
                            </button>
                            <button
                              onClick={() => handleTechSelect(tech, 'excluded')}
                              style={{
                                borderRadius: '4px',
                                backgroundColor: '#f9fafb',
                                color: '#374151',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="除外技術として追加"
                            >
                              除外
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: type === 'required' ? '#fef2f2' : 
                                              type === 'preferred' ? '#f0fdf4' : '#f9fafb',
                              color: type === 'required' ? '#b91c1c' :
                                     type === 'preferred' ? '#15803d' : '#374151'
                            }}>
                              {type === 'required' ? '必須' : type === 'preferred' ? '歓迎' : '除外'}
                            </span>
                            <button
                              onClick={() => handleTechRemove(tech.id)}
                              style={{
                                color: '#ef4444',
                                fontSize: '14px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '0 4px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Technologies */}
              {selectedTechnologies.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h4 className="text-md font-medium text-gray-900 mb-3">選択済み技術</h4>
                  <div className="space-y-2">
                    {selectedTechnologies.map(tech => {
                      const type = getTechType(tech.id);
                      return (
                        <div key={tech.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">{tech.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                              type === 'required' ? 'bg-red-100 text-red-800' :
                              type === 'preferred' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {type === 'required' ? '必須' : type === 'preferred' ? '歓迎' : '除外'}
                            </span>
                            <button
                              onClick={() => handleTechRemove(tech.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Options */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-md font-medium text-gray-900">検索オプション</h4>
                  <ChevronDownIcon 
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                      showFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {showFilters && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        検索モード
                      </label>
                      <select
                        value={searchConfig.search_mode}
                        onChange={(e) => setSearchConfig(prev => ({
                          ...prev,
                          search_mode: e.target.value as 'AND' | 'OR'
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="OR">いずれか (OR)</option>
                        <option value="AND">すべて (AND)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最低マッチスコア: {searchConfig.min_match_score}%
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
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        勤務地
                      </label>
                      <input
                        type="text"
                        placeholder="東京、大阪など"
                        value={searchConfig.location || ''}
                        onChange={(e) => setSearchConfig(prev => ({
                          ...prev,
                          location: e.target.value
                        }))}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isLoading || (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  backgroundColor: isLoading || (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0) ? '#9ca3af' : '#2563eb',
                  padding: '12px 16px',
                  color: 'white',
                  fontWeight: '500',
                  border: 'none',
                  cursor: isLoading || (searchConfig.required_tech.length === 0 && searchConfig.preferred_tech.length === 0) ? 'not-allowed' : 'pointer',
                  marginTop: '16px'
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    検索中...
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MagnifyingGlassIcon style={{ height: '16px', width: '16px' }} />
                    企業を検索
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Search Results */}
          <div className="lg:col-span-2">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    検索結果 ({searchResults.length}件)
                  </h3>
                </div>
                
                {searchResults.map(company => (
                  <div key={company.id} className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-xl font-semibold text-gray-900">{company.name}</h4>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            マッチ度: {company.match_score}%
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{company.industry}</span>
                          <span>•</span>
                          <span>{company.location}</span>
                          <span>•</span>
                          <span>{company.job_postings_count}件の求人</span>
                        </div>
                        
                        <p className="mt-3 text-gray-600" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{company.description}</p>
                        
                        {/* Matching Technologies */}
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">マッチした技術:</h5>
                          <div className="flex flex-wrap gap-2">
                            {company.matching_technologies.map((tech, index) => (
                              <span key={`company-${company.id}-matching-${tech.id}-${index}`} className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Main Technologies */}
                        {company.main_technologies.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">主要技術:</h5>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(new Set(company.main_technologies.map(tech => tech.id)))
                                .map((uniqueId, index) => {
                                  const tech = company.main_technologies.find(t => t.id === uniqueId);
                                  return (
                                    <span key={`company-${company.id}-main-${uniqueId}-${index}`} className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                      {tech?.name}
                                    </span>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/companies/${company.id}`)}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-12 shadow-sm text-center">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が表示されます</h3>
                <p className="text-gray-600">
                  左側から技術を選択して企業を検索してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}