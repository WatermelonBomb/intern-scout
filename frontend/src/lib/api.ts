import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

// Auth API
export const auth = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.delete('/auth/logout'),
};

// Users API
export const users = {
  index: () => api.get('/users'),
  show: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  search: (params: any) => api.get('/users/search', { params }),
};

// Messages API
export const messages = {
  index: () => api.get('/messages'),
  show: (id: number) => api.get(`/messages/${id}`),
  create: (data: any) => api.post('/messages', data),
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
  create: (data: any) => api.post('/job_postings', data),
  update: (id: number, data: any) => api.put(`/job_postings/${id}`, data),
  delete: (id: number) => api.delete(`/job_postings/${id}`),
};

// Applications API
export const applications = {
  index: () => api.get('/applications'),
  show: (id: number) => api.get(`/applications/${id}`),
  create: (jobPostingId: number, data: { cover_letter: string }) => 
    api.post(`/job_postings/${jobPostingId}/applications`, data),
  update: (id: number, data: { status: string }) => api.put(`/applications/${id}`, data),
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
  create: (data: { student_id: number; job_posting_id: number; message: string }) => 
    api.post('/invitations', { invitation: data }),
  accept: (id: number) => api.patch(`/invitations/${id}/accept`),
  reject: (id: number) => api.patch(`/invitations/${id}/reject`),
  delete: (id: number) => api.delete(`/invitations/${id}`),
  bulkCreate: (data: { student_ids: number[]; job_posting_id: number; message: string; scout_template_id?: number }) => 
    api.post('/invitations/bulk_create', data),
};

// Students API (for company search)
export const students = {
  index: (filters?: {
    major?: string;
    preferred_location?: string;
    experience_level?: string;
    graduation_year?: number;
    programming_language?: string;
    skills?: string;
    limit?: number;
    offset?: number;
  }) => {
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
  create: (data: { name: string; subject: string; message: string }) => 
    api.post('/scout_templates', { scout_template: data }),
  update: (id: number, data: { name?: string; subject?: string; message?: string; is_active?: boolean }) => 
    api.patch(`/scout_templates/${id}`, { scout_template: data }),
  delete: (id: number) => api.delete(`/scout_templates/${id}`),
  clone: (id: number) => api.post(`/scout_templates/${id}/clone`),
};

// Dashboard API
export const dashboard = {
  stats: () => api.get('/dashboard/stats'),
};

export default api;