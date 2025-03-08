'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { DatePerson, DatePersonForm as DatePersonFormData } from '@/types';
import { getAllDatePersons, addDatePerson, updateDatePerson, deleteDatePerson } from '@/utils/storage';
import DatePersonCard from '@/components/DatePersonCard';
import DatePersonForm from '@/components/DatePersonForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import Image from 'next/image';

export default function Home() {
  const [datePersons, setDatePersons] = useState<DatePerson[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DatePerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);

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
  const handleAddPerson = (data: DatePersonFormData) => {
    addDatePerson({
      ...data,
      positiveTags: data.positiveTags || [],
      negativeTags: data.negativeTags || [],
      personalityTags: data.personalityTags || [],
    });
    
    setShowAddForm(false);
    setDatePersons(getAllDatePersons());
  };

  // 處理更新約會對象
  const handleUpdatePerson = (data: DatePersonFormData) => {
    if (editingPerson) {
      updateDatePerson(editingPerson.id, {
        ...data,
        positiveTags: data.positiveTags || [],
        negativeTags: data.negativeTags || [],
        personalityTags: data.personalityTags || [],
      });
      
      setEditingPerson(null);
      setDatePersons(getAllDatePersons());
    }
  };

  // 處理刪除約會對象
  const handleDeletePerson = (id: string) => {
    setPersonToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      deleteDatePerson(personToDelete);
      setEditingPerson(null);
      setDatePersons(getAllDatePersons());
      setShowDeleteConfirm(false);
      setPersonToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPersonToDelete(null);
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
          哥布林小抄
        </h1>
        <p className="text-gray-300">
          記錄你的暈船對象，不放過每一個心動瞬間
        </p>
      </header>

      {/* 搜尋和排序 - 只在有資料時顯示 */}
      {datePersons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋姓名、職業、標籤..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200"
            />
          </div>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 hover:bg-gray-700 flex items-center gap-2 text-gray-200"
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
            className="btn-primary"
          >
            <FaPlus />
            <span>新增對象</span>
          </button>
        </div>
      )}

      {/* 約會對象列表 */}
      {filteredAndSortedPersons.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <div className="space-y-4">
              <p className="text-gray-300 text-xl font-bold">沒有找到符合的約會對象，你確定有這個人嗎</p>
              <div className="w-70 h-48 mx-auto">
                <Image 
                  src="/welcome.jpg" 
                  alt="沒有找到符合的約會對象" 
                  width={300} 
                  height={200}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FaHeart className="text-primary mx-auto text-5xl heart-beat" />
              <div className="w-70 h-48 mx-auto">
                <Image 
                  src="/welcome.jpg" 
                  alt="還沒有約會對象" 
                  width={300} 
                  height={200}
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
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
              onClick={() => setEditingPerson(person)}
            />
          ))}
        </div>
      )}

      {/* 添加/編輯表單模態框 */}
      {(showAddForm || editingPerson) && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DatePersonForm
              initialData={editingPerson || undefined}
              onSubmit={editingPerson ? handleUpdatePerson : handleAddPerson}
              onCancel={() => {
                setShowAddForm(false);
                setEditingPerson(null);
              }}
              onDelete={editingPerson ? () => handleDeletePerson(editingPerson.id) : undefined}
            />
          </div>
        </div>
      )}

      {/* 確認刪除對話框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="不暈了？"
        message="恭喜你成功清醒，刪除後不能復原喔"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </main>
  );
}
