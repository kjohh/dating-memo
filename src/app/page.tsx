'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { DatePerson, DatePersonForm as DatePersonFormData, RELATIONSHIP_STATUSES } from '@/types';
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
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  
  const sortMenuRef = useRef<HTMLDivElement>(null);

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

  // 點擊外部關閉排序菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        (person.relationshipStatus && person.relationshipStatus.includes(searchLower)) ||
        [...person.positiveTags, ...person.negativeTags, ...person.personalityTags]
          .some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.updatedAt.getTime();
        const dateB = b.updatedAt.getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        // 根據關係狀態排序
        const statusA = RELATIONSHIP_STATUSES.indexOf(a.relationshipStatus);
        const statusB = RELATIONSHIP_STATUSES.indexOf(b.relationshipStatus);
        return sortOrder === 'desc' ? statusA - statusB : statusB - statusA;
      }
    });

  // 獲取排序文字
  const getSortText = () => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' ? '最新優先' : '最早優先';
    } else {
      return sortOrder === 'desc' ? '關係進展由淺至深' : '關係進展由深至淺';
    }
  };

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
        <div className="flex gap-2 mb-6 items-center">
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
          
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-lg border border-gray-700 bg-gray-800/70 hover:bg-gray-700 flex items-center justify-center text-gray-200"
              aria-label="排序選項"
            >
              <FaFilter />
            </button>
            
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="p-2 border-b border-gray-700 text-sm font-medium text-gray-300">排序方式</div>
                <button
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder('desc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                    sortBy === 'date' && sortOrder === 'desc' ? 'bg-gray-700' : ''
                  }`}
                >
                  <FaSortAmountDown className="text-gray-400" />
                  <span>最新優先</span>
                </button>
                <button
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder('asc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                    sortBy === 'date' && sortOrder === 'asc' ? 'bg-gray-700' : ''
                  }`}
                >
                  <FaSortAmountUp className="text-gray-400" />
                  <span>最早優先</span>
                </button>
                <button
                  onClick={() => {
                    setSortBy('status');
                    setSortOrder('desc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                    sortBy === 'status' && sortOrder === 'desc' ? 'bg-gray-700' : ''
                  }`}
                >
                  <FaHeart className="text-gray-400" />
                  <span>關係進展由淺至深</span>
                </button>
                <button
                  onClick={() => {
                    setSortBy('status');
                    setSortOrder('asc');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 ${
                    sortBy === 'status' && sortOrder === 'asc' ? 'bg-gray-700' : ''
                  }`}
                >
                  <FaHeart className="text-gray-400" />
                  <span>關係進展由深至淺</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <FaPlus />
            <span className="hidden sm:inline">新增對象</span>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full h-full md:rounded-xl md:max-w-2xl md:h-auto md:max-h-[90vh] overflow-y-auto">
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
