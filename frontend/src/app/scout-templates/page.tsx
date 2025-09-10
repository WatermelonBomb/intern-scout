'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { scoutTemplates } from '../../lib/api';

interface ScoutTemplate {
  id: number;
  name: string;
  subject: string;
  message: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export default function ScoutTemplates() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<ScoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScoutTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await scoutTemplates.index();
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showToast('すべての項目を入力してください', 'error');
      return;
    }

    try {
      if (editingTemplate) {
        await scoutTemplates.update(editingTemplate.id, formData);
      } else {
        await scoutTemplates.create(formData);
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      setFormData({ name: '', subject: '', message: '' });
      loadTemplates();
    } catch (error: any) {
      console.error('Failed to save template:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'テンプレートの保存に失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  const handleEdit = (template: ScoutTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      message: template.message
    });
    setShowForm(true);
  };

  const handleDelete = async (template: ScoutTemplate) => {
    if (!confirm(`「${template.name}」を削除しますか？`)) {
      return;
    }

    try {
      await scoutTemplates.delete(template.id);
      loadTemplates();
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'テンプレートの削除に失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  const handleToggleActive = async (template: ScoutTemplate) => {
    try {
      await scoutTemplates.update(template.id, {
        is_active: !template.is_active
      });
      loadTemplates();
    } catch (error: any) {
      console.error('Failed to toggle template status:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'ステータスの更新に失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  const handleClone = async (template: ScoutTemplate) => {
    try {
      await scoutTemplates.clone(template.id);
      loadTemplates();
    } catch (error: any) {
      console.error('Failed to clone template:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'テンプレートのコピーに失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', message: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">スカウトテンプレート</h1>
              <p className="text-gray-600">よく使用するスカウトメッセージをテンプレートとして保存・管理</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新規テンプレート作成
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {editingTemplate ? 'テンプレート編集' : '新規テンプレート作成'}
                  </h2>
                  <button
                    onClick={cancelForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      テンプレート名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 新卒エンジニア向けスカウト"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      件名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 【株式会社○○】エンジニア採用のご案内"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メッセージ本文 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="スカウトメッセージを入力してください..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingTemplate ? '更新' : '作成'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 mb-4">テンプレートがありません</div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              初めてのテンプレート作成
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.is_active ? '有効' : '無効'}
                        </span>
                        <span className="text-sm text-gray-500">
                          使用回数: {template.usage_count}回
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">件名:</div>
                        <div className="text-sm text-gray-600">{template.subject}</div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">メッセージ:</div>
                        <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap line-clamp-4">
                          {template.message}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        作成日: {formatDate(template.created_at)} | 
                        更新日: {formatDate(template.updated_at)}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleClone(template)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        複製
                      </button>
                      <button
                        onClick={() => handleToggleActive(template)}
                        className={`text-sm ${
                          template.is_active 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {template.is_active ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}