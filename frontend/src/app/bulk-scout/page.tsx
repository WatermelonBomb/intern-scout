'use client';

import React, { useState, useEffect } from 'react';
import { students, jobPostings, scoutTemplates, invitations } from '../../lib/api';

interface Student {
  id: number;
  name: string;
  email: string;
  university: string;
  major: string;
  graduation_year: number;
  preferred_location: string;
  experience_level: string;
  programming_languages: string[];
  skills: string;
  bio: string;
  job_search_status: string;
}

interface JobPosting {
  id: number;
  title: string;
  employment_type: string;
}

interface ScoutTemplate {
  id: number;
  name: string;
  subject: string;
  message: string;
  is_active: boolean;
}

interface FilterOptions {
  majors: string[];
  preferred_locations: string[];
  experience_levels: string[];
  graduation_years: number[];
  programming_languages: string[];
}

export default function BulkScout() {
  const { showToast } = useToast();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [jobPostingsList, setJobPostingsList] = useState<JobPosting[]>([]);
  const [templatesList, setTemplatesList] = useState<ScoutTemplate[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    majors: [],
    preferred_locations: [],
    experience_levels: [],
    graduation_years: [],
    programming_languages: []
  });

  // フィルター状態
  const [filters, setFilters] = useState({
    major: '',
    preferred_location: '',
    experience_level: '',
    graduation_year: '',
    programming_language: '',
    skills: ''
  });

  // 送信フォーム状態
  const [selectedJobPosting, setSelectedJobPosting] = useState<number | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchStudents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [jobPostingsResponse, templatesResponse, filterOptionsResponse] = await Promise.all([
        jobPostings.index(),
        scoutTemplates.index(),
        students.filterOptions()
      ]);

      setJobPostingsList(jobPostingsResponse.data.data);
      setTemplatesList(templatesResponse.data.data);
      setFilterOptions(filterOptionsResponse.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const searchStudents = async () => {
    setStudentsLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await students.index({ ...cleanFilters, limit: 100 });
      setStudentsList(response.data.data);
    } catch (error) {
      console.error('Failed to search students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === studentsList.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsList.map(s => s.id));
    }
  };

  const handleTemplateChange = (templateId: number | '') => {
    setSelectedTemplate(templateId);
    
    if (templateId !== '') {
      const template = templatesList.find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setMessage(template.message);
      }
    } else {
      setSubject('');
      setMessage('');
    }
  };

  const handleBulkSend = async () => {
    if (selectedStudents.length === 0 || !selectedJobPosting || !message.trim()) {
      showToast('送信先の学生、求人、メッセージを選択・入力してください', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await invitations.bulkCreate({
        student_ids: selectedStudents,
        job_posting_id: Number(selectedJobPosting),
        message: message.trim(),
        scout_template_id: selectedTemplate !== '' ? Number(selectedTemplate) : undefined
      });

      showToast(response.data.message, 'success');
      setSelectedStudents([]);
      setMessage('');
      setSubject('');
      setSelectedTemplate('');
      
    } catch (error: any) {
      console.error('Failed to send bulk scouts:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウト送信に失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">一括スカウト送信</h1>
          <p className="text-gray-600">条件に合う学生を検索して、一括でスカウトを送信できます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 学生検索・選択エリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* 検索フィルター */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">学生検索フィルター</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">専攻</label>
                  <select 
                    value={filters.major} 
                    onChange={(e) => setFilters({...filters, major: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべて</option>
                    {filterOptions.majors.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望勤務地</label>
                  <select 
                    value={filters.preferred_location} 
                    onChange={(e) => setFilters({...filters, preferred_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべて</option>
                    {filterOptions.preferred_locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">経験レベル</label>
                  <select 
                    value={filters.experience_level} 
                    onChange={(e) => setFilters({...filters, experience_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">卒業年度</label>
                  <select 
                    value={filters.graduation_year} 
                    onChange={(e) => setFilters({...filters, graduation_year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべて</option>
                    {filterOptions.graduation_years.map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">プログラミング言語</label>
                  <select 
                    value={filters.programming_language} 
                    onChange={(e) => setFilters({...filters, programming_language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべて</option>
                    {filterOptions.programming_languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">スキル</label>
                  <input
                    type="text"
                    value={filters.skills}
                    onChange={(e) => setFilters({...filters, skills: e.target.value})}
                    placeholder="キーワードで検索"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 学生一覧 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    検索結果 ({studentsList.length}名)
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {selectedStudents.length}名選択中
                    </span>
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      {selectedStudents.length === studentsList.length ? '全て解除' : '全て選択'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {studentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500">検索中...</div>
                  </div>
                ) : studentsList.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500">条件に合う学生が見つかりませんでした</div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {studentsList.map((student) => (
                      <div key={student.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelection(student.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                <p className="text-sm text-gray-600">{student.university}</p>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                {student.graduation_year}年卒業
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex flex-wrap gap-2">
                                {student.major && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {student.major}
                                  </span>
                                )}
                                {student.preferred_location && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    {student.preferred_location}
                                  </span>
                                )}
                                {student.experience_level && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                    {student.experience_level === 'beginner' ? '初級' : 
                                     student.experience_level === 'intermediate' ? '中級' : '上級'}
                                  </span>
                                )}
                              </div>
                              {student.programming_languages.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {student.programming_languages.map((lang, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {lang}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {student.skills && (
                                <p className="text-sm text-gray-600 line-clamp-2">{student.skills}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* スカウト送信フォーム */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">スカウト送信</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">対象求人</label>
                  <select
                    value={selectedJobPosting}
                    onChange={(e) => setSelectedJobPosting(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">求人を選択してください</option>
                    {jobPostingsList.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.employment_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    テンプレート（任意）
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">テンプレートなし</option>
                    {templatesList.filter(t => t.is_active).map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate !== '' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">件名</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="スカウトの件名"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="スカウトメッセージを入力してください..."
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>送信予定:</strong> {selectedStudents.length}名</p>
                    {selectedJobPosting && (
                      <p><strong>求人:</strong> {jobPostingsList.find(j => j.id === Number(selectedJobPosting))?.title}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleBulkSend}
                    disabled={loading || selectedStudents.length === 0 || !selectedJobPosting || !message.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? '送信中...' : '一括スカウト送信'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}