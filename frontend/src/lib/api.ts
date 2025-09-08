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
  employment_type: string;
  deadline?: string;
  active: boolean;
  created_at: string;
  company: Company;
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

// Dashboard API
export const dashboard = {
  stats: () => api.get('/dashboard/stats'),
};

export default api;