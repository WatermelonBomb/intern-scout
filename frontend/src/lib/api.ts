import axios from 'axios';

export interface ApiErrorResponse {
  errors?: string | string[];
  message?: string;
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Debug: Log the baseURL
console.log('API baseURL:', api.defaults.baseURL);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: 'student' | 'company';
  university?: string;
  graduation_year?: number;
  bio?: string;
  skills?: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  description?: string;
  website?: string;
  location?: string;
}

export interface Message {
  id: number;
  subject: string;
  content: string;
  read_at?: string;
  read: boolean;
  created_at: string;
  sender: User;
  receiver: User;
}

export interface Conversation {
  id: number;
  other_user: User;
  last_message?: {
    id: number;
    content: string;
    created_at: string;
    sender_id: number;
  };
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  salary?: string;
  employment_type: string;
  deadline?: string;
  application_deadline?: string;
  active: boolean;
  created_at: string;
  company: Company;
  applications_count?: number;
  pending_applications_count?: number;
  has_applied?: boolean;
  user_application?: Application;
}

export interface Application {
  id: number;
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
  student: User;
  job_posting: {
    id: number;
    title: string;
    company: {
      id: number;
      name: string;
    };
  };
}

export interface Invitation {
  id: number;
  message: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  sent_at: string;
  responded_at?: string;
  company: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    name: string;
  };
  job_posting: {
    id: number;
    title: string;
    employment_type: string;
  };
}

export type ApplicationStatus = Application['status'];

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  university?: string | null;
  graduation_year?: number | null;
  bio?: string | null;
  skills?: string | null;
  major?: string | null;
  preferred_location?: string | null;
  experience_level?: string | null;
  job_search_status?: string | null;
  programming_languages?: string[];
}

export interface CompanyProfilePayload {
  name?: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
}

export interface UserSearchParams {
  skills?: string;
  university?: string;
  graduation_year?: number;
}

export interface MessagePayload {
  receiver_id: number;
  subject: string;
  content: string;
  conversation_id?: number;
}

export interface JobPostingPayload {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  salary?: string;
  employment_type: string;
  deadline?: string | null;
  application_deadline?: string | null;
}

export type JobPostingUpdatePayload = Partial<JobPostingPayload> & Pick<JobPostingPayload, 'title' | 'description' | 'employment_type'>;

export type ApplicationUpdatePayload = Pick<Application, 'status'>;

export interface InvitationPayload {
  student_id: number;
  job_posting_id: number;
  message: string;
  scout_template_id?: number;
}

export interface InvitationBulkPayload {
  student_ids: number[];
  job_posting_id: number;
  message: string;
  scout_template_id?: number;
}

export interface StudentSearchFilters {
  major?: string;
  preferred_location?: string;
  experience_level?: string;
  graduation_year?: number;
  programming_language?: string;
  skills?: string;
  limit?: number;
  offset?: number;
}

export interface ScoutTemplatePayload {
  name?: string;
  subject?: string;
  message?: string;
  is_active?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'company';
  university?: string;
  graduation_year?: number;
  bio?: string;
  skills?: string;
  company_name?: string;
  industry?: string;
  company_description?: string;
  website?: string;
  location?: string;
}

// Auth API
export const auth = {
  signup: (data: SignupRequest) => api.post('/auth/signup', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.delete('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const users = {
  index: () => api.get('/users'),
  show: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: UserUpdatePayload & CompanyProfilePayload) => api.put(`/users/${id}`, data),
  search: (params: UserSearchParams) => api.get('/users/search', { params }),
};

// Messages API
export const messages = {
  index: () => api.get('/messages'),
  show: (id: number) => api.get(`/messages/${id}`),
  create: (data: MessagePayload) => api.post('/messages', data),
  markAsRead: (id: number) => api.patch(`/messages/${id}/mark_as_read`),
};

// Conversations API
export const conversations = {
  index: () => api.get('/conversations'),
  show: (id: number) => api.get(`/conversations/${id}`),
  create: (userId: number) => api.post('/conversations', { user_id: userId }),
};

// Job Postings API
export const jobPostings = {
  index: () => api.get('/job_postings'),
  show: (id: number) => api.get(`/job_postings/${id}`),
  create: (data: JobPostingPayload) => api.post('/job_postings', data),
  update: (id: number, data: JobPostingUpdatePayload) => api.put(`/job_postings/${id}`, data),
  delete: (id: number) => api.delete(`/job_postings/${id}`),
};

// Applications API
export const applications = {
  index: () => api.get('/applications'),
  show: (id: number) => api.get(`/applications/${id}`),
  create: (jobPostingId: number, data: { cover_letter: string }) => 
    api.post(`/job_postings/${jobPostingId}/applications`, data),
  update: (id: number, data: ApplicationUpdatePayload) => api.put(`/applications/${id}`, data),
  delete: (id: number) => api.delete(`/applications/${id}`),
};

// Invitations API
export const invitations = {
  index: (sent?: boolean, status?: string) => {
    const params = new URLSearchParams();
    if (sent) params.append('sent', 'true');
    if (status) params.append('status', status);
    return api.get(`/invitations?${params.toString()}`);
  },
  show: (id: number) => api.get(`/invitations/${id}`),
  create: (data: InvitationPayload) => 
    api.post('/invitations', { invitation: data }),
  accept: (id: number) => api.patch(`/invitations/${id}/accept`),
  reject: (id: number) => api.patch(`/invitations/${id}/reject`),
  delete: (id: number) => api.delete(`/invitations/${id}`),
  bulkCreate: (data: InvitationBulkPayload) => 
    api.post('/invitations/bulk_create', data),
};

// Students API (for company search)
export const students = {
  index: (filters?: StudentSearchFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/students?${params.toString()}`);
  },
  filterOptions: () => api.get('/students/filter_options'),
};

// Scout Templates API
export const scoutTemplates = {
  index: () => api.get('/scout_templates'),
  show: (id: number) => api.get(`/scout_templates/${id}`),
  create: (data: Required<Pick<ScoutTemplatePayload, 'name' | 'message'>> & { subject: string }) => 
    api.post('/scout_templates', { scout_template: data }),
  update: (id: number, data: ScoutTemplatePayload) => 
    api.patch(`/scout_templates/${id}`, { scout_template: data }),
  delete: (id: number) => api.delete(`/scout_templates/${id}`),
  clone: (id: number) => api.post(`/scout_templates/${id}/clone`),
};

// Technologies API
export const technologies = {
  index: (params?: { category?: string; search?: string; sort?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/technologies?${searchParams.toString()}`);
  },
  show: (id: number) => api.get(`/technologies/${id}`),
  trending: () => api.get('/technologies/trending'),
  combinations: (techId: number) => api.get(`/technologies/combinations?tech_id=${techId}`),
};

// Tech Search API
export const techSearch = {
  searchCompanies: (searchParams: {
    search_mode?: string;
    min_match_score?: number;
    company_size?: string;
    location?: string;
    required_tech?: number[];
    preferred_tech?: number[];
    excluded_tech?: number[];
    categories?: string[];
  }) => api.post('/search/companies', { search: searchParams }),
  
  searchJobs: (searchParams: {
    search_mode?: string;
    min_match_score?: number;
    employment_type?: string;
    location?: string;
    required_tech?: number[];
    preferred_tech?: number[];
    excluded_tech?: number[];
  }) => api.post('/search/jobs', { search: searchParams }),
};

// Dashboard API
export const dashboard = {
  stats: () => api.get('/dashboard/stats'),
};

export default api;
