'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa';
import { DatePerson } from '@/types';
import { getAllDatePersons, addDatePerson, updateDatePerson, deleteDatePerson } from '@/utils/storage';
import DatePersonCard from '@/components/DatePersonCard';
import DatePersonForm from '@/components/DatePersonForm';
import StarRating from '@/components/StarRating';

export default function Home() {
  const [datePersons, setDatePersons] = useState<DatePerson[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DatePerson | null>(null);
  const [viewingPerson, setViewingPerson] = useState<DatePerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 加載數據
  useEffect(() => {
    const loadData = () => {
      const data = getAllDatePersons();
      setDatePersons(data);
    };

    loadData();
    
    // 添加事件監聽器，以便在其他標籤頁中更新數據時刷新
    window.addEventListener('storage', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // 處理添加新約會對象
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

  // 處理更新約會對象
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

  // 處理刪除約會對象
  const handleDeletePerson = (id: string) => {
    if (window.confirm('確定要刪除這個約會對象嗎？')) {
      deleteDatePerson(id);
      setViewingPerson(null);
      setDatePersons(getAllDatePersons());
    }
  };

  // 過濾和排序約會對象
  const filteredAndSortedPersons = datePersons
    .filter(person => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        person.name.toLowerCase().includes(searchLower) ||
        (person.occupation && person.occupation.toLowerCase().includes(searchLower)) ||
        (person.meetChannel && person.meetChannel.toLowerCase().includes(searchLower)) ||
        [...person.positiveTags, ...person.negativeTags, ...person.personalityTags]
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
      {/* 頭部 */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 gradient-text inline-block">
          約會備忘錄
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          記錄你的約會對象，不錯過每一個心動瞬間
        </p>
      </header>

      {/* 搜尋和排序 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋姓名、職業、標籤..."
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
              <span>最新優先</span>
            </>
          ) : (
            <>
              <FaSortAmountUp />
              <span>最早優先</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white flex items-center gap-2"
        >
          <FaPlus />
          <span>新增對象</span>
        </button>
      </div>

      {/* 約會對象列表 */}
      {filteredAndSortedPersons.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <p className="text-gray-500">沒有找到符合的約會對象</p>
          ) : (
            <div className="space-y-4">
              <FaHeart className="text-primary mx-auto text-5xl heart-beat" />
              <p className="text-gray-500">還沒有新增約會對象</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white inline-flex items-center gap-2"
              >
                <FaPlus />
                <span>新增第一個約會對象</span>
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

      {/* 添加/編輯表單模態框 */}
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

      {/* 查看詳情模態框 */}
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
                {viewingPerson.name} 的詳細資料
              </h2>
              
              <div className="space-y-6">
                {/* 基本資訊 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                    
                    {viewingPerson.age && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">年齡</h3>
                        <p>{viewingPerson.age} 歲</p>
                      </div>
                    )}
                    
                    {viewingPerson.gender && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">性別</h3>
                        <p>{viewingPerson.gender}</p>
                      </div>
                    )}
                    
                    {viewingPerson.occupation && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">職業</h3>
                        <p>{viewingPerson.occupation}</p>
                      </div>
                    )}
                    
                    {viewingPerson.contactInfo && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">社群帳號</h3>
                        <p>{viewingPerson.contactInfo}</p>
                      </div>
                    )}
                    
                    {viewingPerson.meetChannel && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">認識管道</h3>
                        <p>{viewingPerson.meetChannel.includes(':') 
                          ? viewingPerson.meetChannel.replace(':', ': ') 
                          : viewingPerson.meetChannel}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {viewingPerson.rating && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">評分</h3>
                        <StarRating rating={viewingPerson.rating} readonly />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 標籤 */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">特質標籤</h3>
                  
                  {viewingPerson.positiveTags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">優點</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.positiveTags.map(tag => (
                          <span key={tag} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPerson.negativeTags.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">缺點</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.negativeTags.map(tag => (
                          <span key={tag} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewingPerson.personalityTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">性格特質</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingPerson.personalityTags.map(tag => (
                          <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 備註 */}
                {viewingPerson.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">備註</h3>
                    <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      {viewingPerson.notes}
                    </p>
                  </div>
                )}
                
                {/* 操作按鈕 */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingPerson(viewingPerson);
                      setViewingPerson(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDeletePerson(viewingPerson.id)}
                    className="px-4 py-2 rounded-lg bg-error hover:bg-red-600 text-white transition-colors"
                  >
                    刪除
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
