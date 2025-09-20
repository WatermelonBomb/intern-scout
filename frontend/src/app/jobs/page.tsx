'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { jobPostings, type JobPosting, type JobPostingPayload, applications } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

// Add CSS animation for spinner
const spinnerStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function JobPostingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  interface JobFormState {
    title: string;
    description: string;
    requirements: string;
    salary: string;
    location: string;
    application_deadline: string;
    employment_type: string;
  }

  const [jobList, setJobList] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobPosting | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({ cover_letter: '' });
  const [applying, setApplying] = useState(false);
  
  const [jobForm, setJobForm] = useState<JobFormState>({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    application_deadline: '',
    employment_type: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await jobPostings.index();
      setJobList(response.data);
    } catch (error) {
      console.error('Failed to load job postings:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      salary: '',
      location: '',
      application_deadline: '',
      employment_type: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingJob(null);
    setShowCreateModal(true);
  };

  const openEditModal = (job: JobPosting) => {
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      salary: job.salary || '',
      location: job.location || '',
      application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : '',
      employment_type: job.employment_type || ''
    });
    setEditingJob(job);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingJob(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const jobData: JobPostingPayload = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements || undefined,
        location: jobForm.location || undefined,
        employment_type: jobForm.employment_type,
        salary: jobForm.salary || undefined,
        salary_range: jobForm.salary || undefined,
        application_deadline: jobForm.application_deadline || null,
        deadline: jobForm.application_deadline || null,
      };

      if (editingJob) {
        await jobPostings.update(editingJob.id, jobData);
        setMessage({ type: 'success', text: '求人情報を更新しました' });
      } else {
        await jobPostings.create(jobData);
        setMessage({ type: 'success', text: '求人を投稿しました' });
      }

      await loadJobs();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '操作に失敗しました');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    if (!window.confirm(`「${job.title}」を削除してもよろしいですか？`)) {
      return;
    }

    setDeletingJob(job);
    try {
      await jobPostings.delete(job.id);
      await loadJobs();
      showToast('求人を削除しました', 'success');
    } catch (error) {
      const errorMessage = getErrorMessage(error, '削除に失敗しました');
      showToast(errorMessage, 'error');
    } finally {
      setDeletingJob(null);
    }
  };

  const openJobDetail = (job: JobPosting) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const closeJobDetail = () => {
    setSelectedJob(null);
    setShowJobDetail(false);
  };

  const openApplicationModal = (job: JobPosting) => {
    setSelectedJob(job);
    setApplicationForm({ cover_letter: '' });
    setShowJobDetail(false);  // 求人詳細モーダルを閉じる
    setShowApplicationModal(true);
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setMessage(null);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    setMessage(null);

    try {
      await applications.create(selectedJob.id, applicationForm);
      setMessage({ type: 'success', text: '応募を送信しました！' });
      await loadJobs(); // Refresh job list
      setTimeout(() => closeApplicationModal(), 2000);
    } catch (error) {
      const errorMessage = getErrorMessage(error, '応募に失敗しました');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          borderBottom: '2px solid #2563eb'
        }}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Student view
  if (user.user_type === 'student') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <style>{spinnerStyles}</style>
        {/* Navigation */}
        <nav style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: '#2563eb', 
                    borderRadius: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>IS</span>
                  </div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>InternScout</h1>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => router.push('/search/tech')}
                  style={{ 
                    color: '#4b5563', 
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#111827'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4b5563'}
                >
                  技術スタック検索
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{ 
                    color: '#4b5563', 
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#111827'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4b5563'}
                >
                  ダッシュボード
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{ 
              marginBottom: '2.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '1rem',
              padding: '2rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.75rem',
                    borderRadius: '0.75rem'
                  }}>
                    <svg style={{ width: '1.75rem', height: '1.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM8 8a1 1 0 00-1 1v.01A1 1 0 008 10h4a1 1 0 001-1V9a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                      求人情報
                    </h1>
                  </div>
                </div>
                <p style={{ fontSize: '1rem', opacity: '0.9', lineHeight: '1.6', margin: '0' }}>
                  あなたにぴったりのインターンシップを探して、キャリアをスタートさせましょう。ここでは最新の求人情報を確認できます。
                </p>
              </div>
            </div>

            {/* Job Listings for Students */}
            <div style={{ 
              backgroundColor: 'white', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', 
              borderRadius: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                padding: '1.5rem 2rem', 
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#111827', margin: '0' }}>
                      募集中の求人
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      {jobList.length}件の求人が見つかりました
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '2rem' }}>
                {jobsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                    <div style={{ 
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '2rem',
                      width: '2rem',
                      borderBottom: '2px solid #2563eb'
                    }}></div>
                  </div>
                ) : jobList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                      borderRadius: '50%',
                      width: '5rem',
                      height: '5rem',
                      margin: '0 auto 1.5rem auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg style={{ 
                        height: '2.5rem', 
                        width: '2.5rem', 
                        color: '#9ca3af' 
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                      </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>求人情報がありません</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>新しい求人が投稿されるまでお待ちください。<br/>パーフェクトな機会が見つかるかもしれません。</p>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                    gap: '1.5rem'
                  }}>
                    <style>
                      {`
                        @media (min-width: 768px) {
                          .job-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                          }
                        }
                        @media (min-width: 1024px) {
                          .job-grid {
                            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                          }
                        }
                        .job-card:hover {
                          transform: translateY(-2px);
                          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
                          border-color: #3b82f6;
                        }
                        .job-tag {
                          display: inline-flex;
                          align-items: center;
                          padding: 0.25rem 0.75rem;
                          background: linear-gradient(135deg, #3b82f6, #2563eb);
                          color: white;
                          font-size: 0.75rem;
                          font-weight: 500;
                          border-radius: 1rem;
                          margin-bottom: 1rem;
                        }
                        .company-badge {
                          background: linear-gradient(135deg, #f59e0b, #d97706);
                          color: white;
                          padding: 0.125rem 0.5rem;
                          border-radius: 0.5rem;
                          font-size: 0.75rem;
                          font-weight: 500;
                          display: inline-flex;
                          align-items: center;
                          gap: 0.25rem;
                        }
                      `}
                    </style>
                    <div className="job-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                      gap: '1.5rem'
                    }}>
                    {jobList.map((job) => (
                      <div key={job.id} className="job-card" style={{ 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '0.75rem', 
                        padding: '1.75rem',
                        transition: 'all 0.2s ease-in-out',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                      }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <div className="job-tag">
                            <svg style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.375rem' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM8 8a1 1 0 00-1 1v.01A1 1 0 008 10h4a1 1 0 001-1V9a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                            {job.employment_type === 'internship' ? 'インターン' : 
                             job.employment_type === 'part_time' ? 'パート' : 
                             job.employment_type === 'full_time' ? 'フルタイム' : 
                             job.employment_type === 'contract' ? '契約' : 'その他'}
                          </div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                            {job.title}
                          </h3>
                          <div className="company-badge" style={{ marginBottom: '1rem' }}>
                            <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                            {job.company?.name || '企業名未設定'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#4b5563' }}>
                            {job.location && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #a7f3d0'
                              }}>
                                <svg style={{ width: '1.125rem', height: '1.125rem', marginRight: '0.5rem', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span style={{ color: '#065f46', fontWeight: '500' }}>{job.location}</span>
                              </div>
                            )}
                            {job.salary && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #fcd34d'
                              }}>
                                <svg style={{ width: '1.125rem', height: '1.125rem', marginRight: '0.5rem', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span style={{ color: '#92400e', fontWeight: '500' }}>{job.salary}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          marginBottom: '1.25rem'
                        }}>
                          <p style={{ 
                            color: '#374151', 
                            fontSize: '0.875rem', 
                            lineHeight: '1.6',
                            margin: '0',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {job.description}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {job.application_deadline && (
                              <div style={{ 
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                background: isDeadlinePassed(job.application_deadline) ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                color: isDeadlinePassed(job.application_deadline) ? '#991b1b' : '#1e40af',
                                border: isDeadlinePassed(job.application_deadline) ? '1px solid #fca5a5' : '1px solid #93c5fd',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {isDeadlinePassed(job.application_deadline) ? '締切済み' : `締切: ${formatDate(job.application_deadline)}`}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openJobDetail(job)}
                            style={{ 
                              padding: '0.75rem 1.5rem', 
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                              color: 'white', 
                              fontSize: '0.875rem', 
                              fontWeight: '600',
                              borderRadius: '0.75rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                              (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.transform = 'translateY(0)';
                              (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.25)';
                            }}
                          >
                            詳細を見る
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Job Detail Modal for Students */}
        {showJobDetail && selectedJob && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(147, 51, 234, 0.1) 100%)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto', 
            height: '100%', 
            width: '100%', 
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '3rem',
            paddingBottom: '3rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .detail-badge {
                  padding: 0.5rem 1rem;
                  border-radius: 1rem;
                  font-size: 0.875rem;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  gap: 0.5rem;
                  transition: all 0.2s ease;
                }
                .detail-badge:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .info-card {
                  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                  border: 1px solid #e2e8f0;
                  border-radius: 1rem;
                  padding: 1.5rem;
                  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                  transition: all 0.2s ease;
                }
                .info-card:hover {
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                }
              `}
            </style>
            <div style={{ 
              position: 'relative', 
              margin: '0 auto', 
              padding: '0', 
              width: '100%',
              maxWidth: '900px',
              maxHeight: '95vh',
              overflowY: 'auto',
              animation: 'slideUp 0.4s ease-out'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}>
                {/* Hero Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM8 8a1 1 0 00-1 1v.01A1 1 0 008 10h4a1 1 0 001-1V9a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                          {selectedJob.employment_type === 'internship' ? 'インターンシップ' : 
                           selectedJob.employment_type === 'part_time' ? 'パートタイム' : 
                           selectedJob.employment_type === 'full_time' ? 'フルタイム' : 
                           selectedJob.employment_type === 'contract' ? '契約社員' : 'その他'}
                        </div>
                        <h1 style={{ 
                          fontSize: '2.25rem', 
                          fontWeight: '800', 
                          lineHeight: '1.2',
                          marginBottom: '0.75rem',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          {selectedJob.title}
                        </h1>
                        <div style={{ 
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '1.125rem',
                          fontWeight: '600'
                        }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          {selectedJob.company?.name || '企業名未設定'}
                        </div>
                      </div>
                      <button
                        onClick={closeJobDetail}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '1rem',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
                          (e.target as HTMLElement).style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
                          (e.target as HTMLElement).style.transform = 'scale(1)';
                        }}
                      >
                        <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div style={{ padding: '2.5rem' }}>

                  {/* Key Information Cards */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <style>
                      {`
                        @media (min-width: 768px) {
                          .info-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                          }
                        }
                        @media (min-width: 1024px) {
                          .info-grid {
                            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                          }
                        }
                      `}
                    </style>
                    <div className="info-grid" style={{
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                      gap: '1.5rem'
                    }}>                    
                      {selectedJob.location && (
                        <div className="info-card">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              padding: '0.75rem',
                              borderRadius: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '1rem'
                            }}>
                              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0', fontWeight: '500' }}>勤務地</p>
                              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', margin: '0' }}>{selectedJob.location}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedJob.salary && (
                        <div className="info-card">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              padding: '0.75rem',
                              borderRadius: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '1rem'
                            }}>
                              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0', fontWeight: '500' }}>給与</p>
                              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', margin: '0' }}>{selectedJob.salary}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="info-card">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            padding: '0.75rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem'
                          }}>
                            <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-4 12v4m0-4a8 8 0 110-16m0 16a8 8 0 110-16m0 16v4" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0', fontWeight: '500' }}>投稿日</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', margin: '0' }}>{formatDate(selectedJob.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedJob.application_deadline && (
                        <div className="info-card">
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{
                              background: isDeadlinePassed(selectedJob.application_deadline) ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              padding: '0.75rem',
                              borderRadius: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '1rem'
                            }}>
                              <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0', fontWeight: '500' }}>応募締切</p>
                              <p style={{ 
                                fontSize: '1.125rem', 
                                fontWeight: '700', 
                                margin: '0',
                                color: isDeadlinePassed(selectedJob.application_deadline) ? '#ef4444' : '#111827'
                              }}>
                                {formatDate(selectedJob.application_deadline)}
                                {isDeadlinePassed(selectedJob.application_deadline) && (
                                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#ef4444' }}> (締切済み)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="info-card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem'
                      }}>
                        <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0' }}>仕事内容</h4>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      border: '1px solid #bae6fd',
                      borderRadius: '1rem',
                      padding: '1.5rem'
                    }}>
                      <p style={{ 
                        color: '#0f172a', 
                        whiteSpace: 'pre-line',
                        fontSize: '1rem',
                        lineHeight: '1.7',
                        margin: '0'
                      }}>
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>

                  {selectedJob.requirements && (
                    <div className="info-card" style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          padding: '0.75rem',
                          borderRadius: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem'
                        }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0' }}>応募要件</h4>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        border: '1px solid #fed7aa',
                        borderRadius: '1rem',
                        padding: '1.5rem'
                      }}>
                        <p style={{ 
                          color: '#0f172a', 
                          whiteSpace: 'pre-line',
                          fontSize: '1rem',
                          lineHeight: '1.7',
                          margin: '0'
                        }}>
                          {selectedJob.requirements}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderTop: '1px solid #e2e8f0',
                  padding: '2rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  borderBottomLeftRadius: '2rem',
                  borderBottomRightRadius: '2rem'
                }}>
                  <button
                    onClick={closeJobDetail}
                    style={{ 
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                      border: '1px solid #d1d5db',
                      borderRadius: '1rem',
                      color: '#374151',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                      (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                      (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                      (e.target as HTMLElement).style.transform = 'translateY(0)';
                      (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    閉じる
                  </button>
                  {!isDeadlinePassed(selectedJob.application_deadline || selectedJob.deadline || '') ? (
                    selectedJob.has_applied ? (
                      <div style={{ 
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}>
                        <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        応募済み
                      </div>
                    ) : (
                      <button
                        onClick={() => openApplicationModal(selectedJob)}
                        style={{ 
                          padding: '0.875rem 2.5rem',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: 'white',
                          borderRadius: '1rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                          (e.target as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)';
                          (e.target as HTMLElement).style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                          (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
                          (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                        }}
                      >
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          応募する
                        </span>
                      </button>
                    )
                  ) : (
                    <div style={{ 
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      borderRadius: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                      <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      応募締切済み
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Application Modal for Students */}
        {showApplicationModal && selectedJob && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(139, 92, 246, 0.1) 100%)',
            backdropFilter: 'blur(12px)',
            overflowY: 'auto', 
            height: '100%', 
            width: '100%', 
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ 
              position: 'relative', 
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              animation: 'slideUp 0.4s ease-out'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}>
                {/* Application Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  color: 'white',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          応募フォーム
                        </div>
                        <h1 style={{ 
                          fontSize: '1.875rem', 
                          fontWeight: '800', 
                          lineHeight: '1.2',
                          marginBottom: '0.5rem',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          {selectedJob.title}
                        </h1>
                        <div style={{ 
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          padding: '0.5rem 1rem',
                          borderRadius: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}>
                          <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          {selectedJob.company?.name || '企業名未設定'}
                        </div>
                      </div>
                      <button
                        onClick={closeApplicationModal}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          borderRadius: '1rem',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
                          (e.target as HTMLElement).style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
                          (e.target as HTMLElement).style.transform = 'scale(1)';
                        }}
                      >
                        <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Form Content */}
                <div style={{ padding: '2.5rem' }}>


                {message && (
                  <div style={{ 
                    marginBottom: '1rem', 
                    borderRadius: '0.375rem', 
                    padding: '1rem',
                    backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2'
                  }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flexShrink: 0 }}>
                        {message.type === 'success' ? (
                          <svg style={{ height: '1.25rem', width: '1.25rem', color: '#4ade80' }} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg style={{ height: '1.25rem', width: '1.25rem', color: '#f87171' }} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div style={{ marginLeft: '0.75rem' }}>
                        <h3 style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500',
                          color: message.type === 'success' ? '#166534' : '#991b1b'
                        }}>
                          {message.text}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                  <form onSubmit={handleApplicationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="info-card">
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          padding: '0.75rem',
                          borderRadius: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem'
                        }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0' }}>志望動機</h3>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0' }}>あなたの想いを伝えましょう</p>
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: '2px solid #bae6fd',
                        borderRadius: '1rem',
                        padding: '0',
                        overflow: 'hidden'
                      }}>
                        <textarea
                          required
                          rows={8}
                          value={applicationForm.cover_letter}
                          onChange={(e) => setApplicationForm({ cover_letter: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '1.5rem',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            minHeight: '200px'
                          }}
                          placeholder="この機会に応募した理由や、あなたの経験・スキルをどう活かせるかを具体的に教えてください。例えば、なぜこの企業で働きたいのか、あなたの学習経験やプロジェクト経験がどう役立つかなどを記載してください。"
                        />
                      </div>
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '0.75rem', border: '1px solid #fed7aa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <svg style={{ width: '1.125rem', height: '1.125rem', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <p style={{ fontWeight: '600', color: '#92400e', margin: '0' }}>ヒント</p>
                        </div>
                        <ul style={{ margin: '0', paddingLeft: '1.25rem', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5' }}>
                          <li>具体的なエピソードや数値を交えて記載</li>
                          <li>企業の事業内容やビジョンへの理解を示す</li>
                          <li>将来の目標やキャリアビジョンとの関連性</li>
                        </ul>
                      </div>
                    </div>

                  {/* Action Buttons */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderTop: '1px solid #e2e8f0',
                    padding: '2rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    borderBottomLeftRadius: '2rem',
                    borderBottomRightRadius: '2rem'
                  }}>
                    <button
                      type="button"
                      onClick={closeApplicationModal}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                        border: '1px solid #d1d5db',
                        borderRadius: '1rem',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                        (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                        (e.target as HTMLElement).style.transform = 'translateY(0)';
                        (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      style={{
                        padding: '1rem 3rem',
                        background: applying ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '1rem',
                        border: 'none',
                        cursor: applying ? 'not-allowed' : 'pointer',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        transition: 'all 0.3s ease',
                        boxShadow: applying ? '0 4px 12px rgba(156, 163, 175, 0.3)' : '0 8px 20px rgba(16, 185, 129, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!applying) {
                          (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #059669, #047857)';
                          (e.target as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)';
                          (e.target as HTMLElement).style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!applying) {
                          (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #10b981, #059669)';
                          (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
                          (e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }
                      }}
                    >
                      {applying ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ 
                            animation: 'spin 1s linear infinite',
                            borderRadius: '50%',
                            height: '1.25rem',
                            width: '1.25rem',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRight: '2px solid white',
                            marginRight: '0.75rem'
                          }}></div>
                          応募中...
                        </div>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          応募する
                        </span>
                      )}
                    </button>
                  </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Company view
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <style>{spinnerStyles}</style>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>IS</span>
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>InternScout</h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ 
                  color: '#4b5563', 
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#111827'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#4b5563'}
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                求人投稿管理
              </h1>
              <p style={{ color: '#4b5563' }}>
                インターンシップの求人情報を管理しましょう
              </p>
            </div>
            <button
              onClick={openCreateModal}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>新規投稿</span>
            </button>
          </div>

          {/* Job Postings List */}
          <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', borderRadius: '0.5rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                投稿済み求人 ({jobList.length}件)
              </h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {jobsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <div style={{ 
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    height: '2rem',
                    width: '2rem',
                    borderBottom: '2px solid #2563eb'
                  }}></div>
                </div>
              ) : jobList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                  <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>求人投稿がありません</h3>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>最初の求人を投稿してみましょう</p>
                  <button
                    onClick={openCreateModal}
                    style={{
                      marginTop: '1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                  >
                    求人を投稿
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {jobList.map((job) => (
                    <div key={job.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: '1' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                            {job.title}
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                              <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location || '場所未設定'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                              <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {job.salary || '給与未設定'}
                            </div>
                          </div>
                          <p style={{ color: '#374151', marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                            {job.description}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', flexWrap: 'wrap' }}>
                            <span>投稿日: {formatDate(job.created_at)}</span>
                            {job.application_deadline && (
                              <span>応募締切: {formatDate(job.application_deadline)}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(job)}
                            style={{
                              padding: '0.5rem 1rem',
                              border: '1px solid #2563eb',
                              color: '#2563eb',
                              borderRadius: '0.5rem',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#eff6ff'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
                            disabled={deletingJob?.id === job.id}
                            style={{
                              padding: '0.5rem 1rem',
                              border: '1px solid #dc2626',
                              color: '#dc2626',
                              borderRadius: '0.5rem',
                              backgroundColor: 'transparent',
                              cursor: deletingJob?.id === job.id ? 'not-allowed' : 'pointer',
                              opacity: deletingJob?.id === job.id ? '0.5' : '1',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (deletingJob?.id !== job.id) {
                                (e.target as HTMLElement).style.backgroundColor = '#fef2f2';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingJob?.id !== job.id) {
                                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {deletingJob?.id === job.id ? '削除中...' : '削除'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(75, 85, 99, 0.5)', 
          overflowY: 'auto', 
          height: '100%', 
          width: '100%', 
          zIndex: 50 
        }}>
          <div style={{ 
            position: 'relative', 
            top: '5rem', 
            margin: '0 auto', 
            padding: '1.25rem', 
            border: '1px solid #e5e7eb', 
            width: '91.6667%',
            maxWidth: '800px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
            borderRadius: '0.375rem', 
            backgroundColor: 'white' 
          }}>
            <style>
              {`
                @media (min-width: 768px) {
                  .modal-width {
                    width: 75% !important;
                  }
                }
                @media (min-width: 1024px) {
                  .modal-width {
                    width: 66.6667% !important;
                  }
                }
              `}
            </style>
            <div className="modal-width" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                  {editingJob ? '求人情報を編集' : '新しい求人を投稿'}
                </h3>
                <button
                  onClick={closeModal}
                  style={{ 
                    color: '#9ca3af', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#4b5563'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#9ca3af'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {message && (
                <div style={{ 
                  marginBottom: '1rem', 
                  borderRadius: '0.375rem', 
                  padding: '1rem',
                  backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2'
                }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flexShrink: 0 }}>
                      {message.type === 'success' ? (
                        <svg style={{ height: '1.25rem', width: '1.25rem', color: '#4ade80' }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg style={{ height: '1.25rem', width: '1.25rem', color: '#f87171' }} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div style={{ marginLeft: '0.75rem' }}>
                      <h3 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        color: message.type === 'success' ? '#166534' : '#991b1b'
                      }}>
                        {message.text}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>求人タイトル *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={handleInputChange}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#2563eb';
                      (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                    placeholder="エンジニアインターン募集"
                  />
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  <style>
                    {`
                      @media (min-width: 768px) {
                        .form-grid {
                          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        }
                      }
                    `}
                  </style>
                  <div className="form-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', 
                    gap: '1.5rem' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>勤務地</label>
                      <input
                        name="location"
                        type="text"
                        value={jobForm.location}
                        onChange={handleInputChange}
                        style={{
                          marginTop: '0.25rem',
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#2563eb';
                          (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#d1d5db';
                          (e.target as HTMLElement).style.boxShadow = 'none';
                        }}
                        placeholder="東京都渋谷区"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>給与</label>
                      <input
                        name="salary"
                        type="text"
                        value={jobForm.salary}
                        onChange={handleInputChange}
                        style={{
                          marginTop: '0.25rem',
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#2563eb';
                          (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#d1d5db';
                          (e.target as HTMLElement).style.boxShadow = 'none';
                        }}
                        placeholder="時給1,200円〜"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  <div className="form-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', 
                    gap: '1.5rem' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>応募締切日</label>
                      <input
                        name="application_deadline"
                        type="date"
                        value={jobForm.application_deadline}
                        onChange={handleInputChange}
                        style={{
                          marginTop: '0.25rem',
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#2563eb';
                          (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#d1d5db';
                          (e.target as HTMLElement).style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>雇用形態 *</label>
                      <select
                        name="employment_type"
                        required
                        value={jobForm.employment_type}
                        onChange={handleInputChange}
                        style={{
                          marginTop: '0.25rem',
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#2563eb';
                          (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.borderColor = '#d1d5db';
                          (e.target as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        <option value="">選択してください</option>
                        <option value="internship">インターンシップ</option>
                        <option value="part_time">パートタイム</option>
                        <option value="full_time">フルタイム</option>
                        <option value="contract">契約社員</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>仕事内容 *</label>
                  <textarea
                    name="description"
                    rows={5}
                    required
                    value={jobForm.description}
                    onChange={handleInputChange}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#2563eb';
                      (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                    placeholder="インターンとして参加していただく業務内容について詳しく説明してください"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>応募要件</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    value={jobForm.requirements}
                    onChange={handleInputChange}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#2563eb';
                      (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                    placeholder="必要なスキルや経験、学年制限など"
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '1rem', 
                  paddingTop: '1rem' 
                }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      color: '#374151',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: saving ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) (e.target as HTMLElement).style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) (e.target as HTMLElement).style.backgroundColor = '#2563eb';
                    }}
                  >
                    {saving ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          animation: 'spin 1s linear infinite',
                          borderRadius: '50%',
                          height: '1rem',
                          width: '1rem',
                          borderBottom: '2px solid white',
                          marginRight: '0.5rem'
                        }}></div>
                        {editingJob ? '更新中...' : '投稿中...'}
                      </div>
                    ) : (
                      editingJob ? '更新' : '投稿'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
