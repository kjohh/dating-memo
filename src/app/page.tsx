'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa';
import { DatePerson } from '@/types';
import { getAllDatePersons, addDatePerson, updateDatePerson, deleteDatePerson } from '@/utils/storage';
import DatePersonCard from '@/components/DatePersonCard';
import DatePersonForm from '@/components/DatePersonForm';

export default function Home() {
  const [datePersons, setDatePersons] = useState<DatePerson[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DatePerson | null>(null);
  const [viewingPerson, setViewingPerson] = useState<DatePerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 加载数据
  useEffect(() => {
    const loadData = () => {
      const data = getAllDatePersons();
      setDatePersons(data);
    };

    loadData();
    
    // 添加事件监听器，以便在其他标签页中更新数据时刷新
    window.addEventListener('storage', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // 处理添加新约会对象
  const handleAddPerson = (data: any) => {
    addDatePerson({
      ...data,
      positiveTags: data.positiveTags || [],
      negativeTags: data.negativeTags || [],
      personalityTags: data.personalityTags || [],
      customTags: data.customTags || [],
    });
    
    setShowAddForm(false);
    setDatePersons(getAllDatePersons());
  };

  // 处理更新约会对象
  const handleUpdatePerson = (data: any) => {
    if (editingPerson) {
      updateDatePerson(editingPerson.id, {
        ...data,
        positiveTags: data.positiveTags || [],
        negativeTags: data.negativeTags || [],
        personalityTags: data.personalityTags || [],
        customTags: data.customTags || [],
      });
      
      setEditingPerson(null);
      setDatePersons(getAllDatePersons());
    }
  };

  // 处理删除约会对象
  const handleDeletePerson = (id: string) => {
    if (window.confirm('确定要删除这个约会对象吗？')) {
      deleteDatePerson(id);
      setViewingPerson(null);
      setDatePersons(getAllDatePersons());
    }
  };

  // 过滤和排序约会对象
  const filteredAndSortedPersons = datePersons
    .filter(person => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        person.name.toLowerCase().includes(searchLower) ||
        (person.occupation && person.occupation.toLowerCase().includes(searchLower)) ||
        (person.meetLocation && person.meetLocation.toLowerCase().includes(searchLower)) ||
        [...person.positiveTags, ...person.negativeTags, ...person.personalityTags, ...person.customTags]
          .some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      const dateA = a.updatedAt.getTime();
      const dateB = b.updatedAt.getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <main className="min-h-screen p-4 max-w-5xl mx-auto">
      {/* 头部 */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 gradient-text inline-block">
          约会备忘录
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          记录你的约会对象，不错过每一个心动瞬间
        </p>
      </header>

      {/* 搜索和排序 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索名字、职业、标签..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
        >
          {sortOrder === 'desc' ? (
            <>
              <FaSortAmountDown />
              <span>最新优先</span>
            </>
          ) : (
            <>
              <FaSortAmountUp />
              <span>最早优先</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white flex items-center gap-2"
        >
          <FaPlus />
          <span>添加新对象</span>
        </button>
      </div>

      {/* 约会对象列表 */}
      {filteredAndSortedPersons.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <p className="text-gray-500">没有找到匹配的约会对象</p>
          ) : (
            <div className="space-y-4">
              <FaHeart className="text-primary mx-auto text-5xl heart-beat" />
              <p className="text-gray-500">还没有添加约会对象</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white inline-flex items-center gap-2"
              >
                <FaPlus />
                <span>添加第一个约会对象</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPersons.map(person => (
            <DatePersonCard
              key={person.id}
              person={person}
              onClick={() => setViewingPerson(person)}
            />
          ))}
        </div>
      )}

      {/* 添加/编辑表单模态框 */}
      {(showAddForm || editingPerson) && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DatePersonForm
              initialData={editingPerson || undefined}
              onSubmit={editingPerson ? handleUpdatePerson : handleAddPerson}
              onCancel={() => {
                setShowAddForm(false);
                setEditingPerson(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 查看详情模态框 */}
      {viewingPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setViewingPerson(null)}
                className="absolute right-0 top-0 p-2 text-gray-500 hover:text-error"
              >
                <FaTimes size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {viewingPerson.name} 的详细资料
              </h2>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4">
                  {viewingPerson.age && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">年龄</h3>
                      <p>{viewingPerson.age} 岁</p>
                    </div>
                  )}
                  
                  {viewingPerson.gender && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">性别</h3>
                      <p>{viewingPerson.gender}</p>
                    </div>
                  )}
                  
                  {viewingPerson.occupation && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">职业</h3>
                      <p>{viewingPerson.occupation}</p>
                    </div>
                  )}
                  
                  {viewingPerson.contactInfo && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">联系方式</h3>
                      <p>{viewingPerson.contactInfo}</p>
                    </div>
                  )}
                </div>
                
                {/* 相遇信息 */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">相遇信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingPerson.meetDate && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">日期</h4>
                        <p>
                          {new Intl.DateTimeFormat('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }).format(viewingPerson.meetDate)}
                        </p>
                      </div>
                    )}
                    
                    {viewingPerson.meetLocation && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">地点</h4>
                        <p>{viewingPerson.meetLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 标签 */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">特质标签</h3>
                  
                  {viewingPerson.positiveTags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">优点</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.positiveTags.map(tag => (
                          <span key={tag} className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPerson.negativeTags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">缺点</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.negativeTags.map(tag => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPerson.personalityTags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">性格</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.personalityTags.map(tag => (
                          <span key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPerson.customTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">自定义标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.customTags.map(tag => (
                          <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 备注 */}
                {viewingPerson.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">备注</h3>
                    <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      {viewingPerson.notes}
                    </p>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingPerson(viewingPerson);
                      setViewingPerson(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeletePerson(viewingPerson.id)}
                    className="px-4 py-2 rounded-lg bg-error hover:bg-red-600 text-white transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
