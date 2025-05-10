'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaFilter, FaEllipsisV } from 'react-icons/fa';
import { DatePerson, DatePersonForm as DatePersonFormData, RELATIONSHIP_STATUSES } from '@/types';
import { getAllDatePersons, addDatePerson, updateDatePerson, deleteDatePerson } from '@/utils/storage';
import DatePersonCard from '@/components/DatePersonCard';
import DatePersonForm from '@/components/DatePersonForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import Image from 'next/image';
import LoginModal from '@/components/LoginModal';
import UserMenu from '@/components/UserMenu';
import { getCurrentUser } from '@/utils/supabase';
import { migrateLocalDataToCloud, fetchCloudData, hasCloudData, mergeLocalAndCloudData } from '@/utils/storageSync';

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dataMode, setDataMode] = useState<'local' | 'cloud'>('local');
  const [syncMessage, setSyncMessage] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });
  
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user);
        
        if (user) {
          const hasCloud = await hasCloudData(user.id);
          
          const storedDataMode = localStorage.getItem('dataMode');
          
          if (hasCloud && storedDataMode === 'cloud') {
            setDataMode('cloud');
            loadCloudData(user.id);
          } else if (hasCloud) {
            showSyncNotification('info', '發現雲端數據。是否要切換到雲端模式？', () => {
              setDataMode('cloud');
              localStorage.setItem('dataMode', 'cloud');
              loadCloudData(user.id);
            });
          }
        }
      } catch (error) {
        console.error('檢查登入狀態失敗:', error);
      }
    };
    
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (dataMode === 'local' || !isLoggedIn) {
        const data = getAllDatePersons();
        setDatePersons(data);
      }
    };

    loadData();
    
    window.addEventListener('storage', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, [dataMode, isLoggedIn]);
  
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
  
  const closeSyncMessage = () => {
    setSyncMessage({ ...syncMessage, show: false });
  };
  
  const showSyncNotification = (type: 'success' | 'error' | 'info', message: string, onConfirm?: () => void) => {
    setSyncMessage({
      show: true,
      type,
      message,
    });
    
    if (type !== 'info') {
      setTimeout(() => {
        closeSyncMessage();
      }, 5000);
    }
  };
  
  const loadCloudData = async (userId: string) => {
    try {
      const { success, data, message } = await fetchCloudData(userId);
      
      if (success && data) {
        setDatePersons(data);
      } else {
        console.error('加載雲端數據失敗:', message);
      }
    } catch (error) {
      console.error('加載雲端數據出錯:', error);
    }
  };
  
  const handleSyncData = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      
      if (dataMode === 'local') {
        const hasCloud = await hasCloudData(user.id);
        
        if (hasCloud) {
          showSyncNotification('info', '發現雲端數據。是否合併本地和雲端數據？', async () => {
            const { success, message } = await mergeLocalAndCloudData(user.id);
            
            if (success) {
              setDataMode('cloud');
              localStorage.setItem('dataMode', 'cloud');
              loadCloudData(user.id);
              showSyncNotification('success', message);
            } else {
              showSyncNotification('error', message);
            }
            
            closeSyncMessage();
          });
        } else {
          const { success, message } = await migrateLocalDataToCloud(user.id);
          
          if (success) {
            setDataMode('cloud');
            localStorage.setItem('dataMode', 'cloud');
            showSyncNotification('success', message);
          } else {
            showSyncNotification('error', message);
          }
        }
      }
    } catch (error) {
      console.error('同步數據失敗:', error);
      showSyncNotification('error', '同步數據失敗，請稍後再試');
    }
  };

  const handleAddPerson = (data: DatePersonFormData) => {
    const newPerson = addDatePerson(data);
    setDatePersons([...datePersons, newPerson]);
    setShowAddForm(false);
  };
  
  const handleEditPerson = (id: string, data: DatePersonFormData) => {
    const updatedPerson = updateDatePerson(id, data);
    if (updatedPerson) {
      setDatePersons(datePersons.map(person => person.id === id ? updatedPerson : person));
    }
    setEditingPerson(null);
  };
  
  const handleDeletePerson = (id: string) => {
    setPersonToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (personToDelete) {
      deleteDatePerson(personToDelete);
      setDatePersons(datePersons.filter(person => person.id !== personToDelete));
      setShowDeleteConfirm(false);
      setPersonToDelete(null);
      setEditingPerson(null);
    }
  };
  
  const handleCancelForm = () => {
    if (editingPerson) {
      setEditingPerson(null);
    } else {
      setShowAddForm(false);
    }
  };
  
  const filteredAndSortedPersons = datePersons
    .filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.occupation && person.occupation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (person.notes && person.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        const statusOrder = RELATIONSHIP_STATUSES.reduce((acc, status, index) => ({
          ...acc,
          [status]: index
        }), {} as Record<string, number>);
        
        const aStatus = statusOrder[a.relationshipStatus] || 0;
        const bStatus = statusOrder[b.relationshipStatus] || 0;
        
        return sortOrder === 'desc' ? aStatus - bStatus : bStatus - aStatus;
      }
    });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };
  
  const getSortMenuPosition = () => {
    if (!sortButtonRef.current) return { top: 0, right: 0 };
    const rect = sortButtonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right,
    };
  };
  
  const renderSortMenu = () => {
    if (!showSortMenu) return null;
    
    const { top, right } = getSortMenuPosition();
    
    const menuContent = (
      <div 
        className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-[999] min-w-[180px]"
        style={{ top: `${top}px`, right: `${right}px` }}
        ref={sortMenuRef}
      >
        <div className="p-2 border-b border-gray-700">
          <div className="text-sm text-gray-400 mb-1">排序方式</div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setSortBy('date');
                setShowSortMenu(false);
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${
                sortBy === 'date' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'
              }`}
            >
              <FaCalendarAlt className="flex-shrink-0" />
              <span className="whitespace-nowrap">按日期</span>
            </button>
            <button
              onClick={() => {
                setSortBy('status');
                setShowSortMenu(false);
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${
                sortBy === 'status' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'
              }`}
            >
              <FaHeart className="flex-shrink-0" />
              <span className="whitespace-nowrap">按關係狀態</span>
            </button>
          </div>
        </div>
        <div className="p-2">
          <div className="text-sm text-gray-400 mb-1">排序順序</div>
          <button
            onClick={() => {
              toggleSortOrder();
              setShowSortMenu(false);
            }}
            className="w-full px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-gray-700"
          >
            {sortOrder === 'desc' ? <FaSortAmountDown className="flex-shrink-0" /> : <FaSortAmountUp className="flex-shrink-0" />}
            <span className="whitespace-nowrap">{sortOrder === 'desc' ? '降序' : '升序'}</span>
          </button>
        </div>
      </div>
    );
    
    return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : null;
  };
  
  const renderSyncNotification = () => {
    if (!syncMessage.show) return null;
    
    const bgColors = {
      success: 'bg-green-900/40 border-green-800',
      error: 'bg-red-900/40 border-red-800',
      info: 'bg-blue-900/40 border-blue-800',
    };
    
    const textColors = {
      success: 'text-green-300',
      error: 'text-red-300',
      info: 'text-blue-300',
    };
    
    return (
      <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg ${bgColors[syncMessage.type]} border ${textColors[syncMessage.type]} z-50`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">{syncMessage.message}</div>
          <button onClick={closeSyncMessage} className="ml-4 text-white">×</button>
        </div>
        
        {syncMessage.type === 'info' && (
          <div className="mt-3 flex justify-end gap-2">
            <button 
              onClick={closeSyncMessage}
              className="px-3 py-1 rounded-md bg-gray-800 text-white text-sm"
            >
              取消
            </button>
            <button 
              onClick={() => {
                closeSyncMessage();
              }}
              className="px-3 py-1 rounded-md bg-primary text-white text-sm"
            >
              確認
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <main className="min-h-screen text-white">
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaHeart className="text-primary" />
            <h1 className="text-xl md:text-2xl font-bold gradient-text">哥布林小抄</h1>
          </div>
          
          <UserMenu 
            onLoginClick={() => setShowLoginModal(true)} 
            onSyncData={handleSyncData} 
            dataMode={dataMode} 
          />
        </div>
      </header>
      
      <div className="sticky top-14 z-10 backdrop-blur-sm p-4 border-b border-gray-800/50">
        <div className="container mx-auto flex justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="搜尋..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <button
              ref={sortButtonRef}
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FaFilter />
              <span className="hidden sm:inline">排序</span>
            </button>
            
            {renderSortMenu()}
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <FaPlus />
            <span className="hidden sm:inline">新增</span>
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {filteredAndSortedPersons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white">
            <Image 
              src="/welcome.jpg" 
              alt="No data" 
              width={400} 
              height={400} 
              className="mb-6"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <FaPlus />
              <span>新增約會對象</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPersons.map(person => (
              <DatePersonCard
                key={person.id}
                person={person}
                onClick={() => setEditingPerson(person)}
              />
            ))}
          </div>
        )}
      </div>
      
      {showAddForm && (
        <DatePersonForm
          onSubmit={handleAddPerson}
          onCancel={handleCancelForm}
        />
      )}
      
      {editingPerson && (
        <DatePersonForm
          initialData={editingPerson}
          onSubmit={(data) => handleEditPerson(editingPerson.id, data)}
          onCancel={handleCancelForm}
          onDelete={() => handleDeletePerson(editingPerson.id)}
        />
      )}
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="確認刪除"
        message="確定要刪除這個約會對象嗎？此操作無法撤銷。"
        confirmText="刪除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {renderSyncNotification()}
    </main>
  );
}
