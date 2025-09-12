import api from '@/lib/api';
import type { Technology, TechCombination, SearchResponse, TechSearchParams } from '@/lib/types/technology';

export const technologyAPI = {
  // Get all technologies
  getTechnologies: async (params?: {
    category?: string;
    search?: string;
    sort?: 'popular' | 'in_demand' | 'name';
    limit?: number;
  }) => {
    const response = await api.get<{
      technologies: Technology[];
      total_count: number;
      categories: string[];
    }>('/technologies', { params });
    return response.data;
  },

  // Get single technology
  getTechnology: async (id: number) => {
    const response = await api.get<{
      technology: Technology & {
        related_technologies: Technology[];
      };
    }>(`/technologies/${id}`);
    return response.data;
  },

  // Get trending technologies
  getTrendingTechnologies: async () => {
    const response = await api.get<{
      trending_technologies: Technology[];
    }>('/technologies/trending');
    return response.data;
  },

  // Get tech combinations
  getTechCombinations: async (techId: number) => {
    const response = await api.get<{
      combinations: TechCombination[];
    }>(`/technologies/${techId}/combinations`);
    return response.data;
  },

  // Search companies by technologies
  searchCompanies: async (searchParams: TechSearchParams) => {
    const response = await api.post<SearchResponse>('/search/companies', {
      search: searchParams
    });
    return response.data;
  },

  // Search jobs by technologies  
  searchJobs: async (searchParams: Omit<TechSearchParams, 'company_size'> & {
    employment_type?: string;
  }) => {
    const response = await api.post('/search/jobs', {
      search: searchParams
    });
    return response.data;
  }
};

export default technologyAPI;