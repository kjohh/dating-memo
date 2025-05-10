'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaHeart, FaSearch, FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaFilter, FaEllipsisV, FaTimes, FaSpinner } from 'react-icons/fa';
import { DatePerson, DatePersonForm as DatePersonFormData, RELATIONSHIP_STATUSES } from '@/types';
import { getAllDatePersons, addDatePerson, updateDatePerson, deleteDatePerson } from '@/utils/storage';
import DatePersonCard from '@/components/DatePersonCard';
import DatePersonForm from '@/components/DatePersonForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import Image from 'next/image';
import LoginModal from '@/components/LoginModal';
import UserMenu from '@/components/UserMenu';
import { getCurrentUser } from '@/utils/supabase';
import { migrateLocalDataToCloud, fetchCloudData, hasCloudData, mergeLocalAndCloudData, addToCloud, updateInCloud, deleteFromCloud } from '@/utils/storageSync';

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
    onConfirm?: () => void;
  }>({ show: false, type: 'info', message: '' });
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
    setSyncMessage(prev => ({ ...prev, show: false }));
  };
  
  const showSyncNotification = useCallback((type: 'success' | 'error' | 'info', message: string, onConfirm?: () => void) => {
    setSyncMessage({
      show: true,
      type,
      message,
      onConfirm
    });
    
    if (type !== 'info') {
      setTimeout(() => {
        setSyncMessage(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  }, []);
  
  const loadCloudData = useCallback(async (userId: string) => {
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
  }, []);
  
  useEffect(() => {
    const syncDataOnModeChange = async () => {
      if (dataMode === 'cloud' && isLoggedIn) {
        try {
          const user = await getCurrentUser();
          if (user) {
            // 檢查是否已有雲端數據
            const hasCloud = await hasCloudData(user.id);
            
            if (!hasCloud && datePersons.length > 0) {
              // 如果沒有雲端數據但有本地數據，自動同步
              const result = await migrateLocalDataToCloud(user.id);
              
              if (result.success) {
                showSyncNotification('success', `已自動同步 ${datePersons.length} 筆數據到雲端`);
              } else {
                showSyncNotification('error', `自動同步失敗: ${result.message}`);
              }
            } else if (hasCloud) {
              // 如果已有雲端數據，加載雲端數據
              const { data, success, message } = await fetchCloudData(user.id);
              
              if (success && data) {
                setDatePersons(data);
              } else {
                showSyncNotification('error', `加載雲端數據失敗: ${message}`);
              }
            }
          }
        } catch (error) {
          showSyncNotification('error', '模式切換時同步數據錯誤，請稍後再試');
        }
      }
    };
    
    syncDataOnModeChange();
  }, [dataMode, isLoggedIn, datePersons.length, showSyncNotification, loadCloudData]);
  
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
      } else {
        loadCloudData(user.id);
        showSyncNotification('success', '已重新載入雲端數據');
      }
    } catch (error) {
      console.error('同步數據失敗:', error);
      showSyncNotification('error', '同步數據失敗，請稍後再試');
    }
  };

  const handleAddPerson = async (data: DatePersonFormData) => {
    const newPerson = addDatePerson(data);
    setDatePersons([...datePersons, newPerson]);
    setShowAddForm(false);
    
    if (isLoggedIn && dataMode === 'cloud') {
      try {
        const user = await getCurrentUser();
        if (user) {
          const result = await addToCloud(newPerson, user.id);
          if (!result.success) {
            showSyncNotification('error', `自動同步失敗：${result.message}`);
          }
        }
      } catch (error) {
        console.error('自動同步新增數據失敗:', error);
        showSyncNotification('error', '自動同步新增數據失敗，請稍後手動同步');
      }
    }
  };
  
  const handleEditPerson = async (id: string, data: DatePersonFormData) => {
    const updatedPerson = updateDatePerson(id, data);
    if (updatedPerson) {
      setDatePersons(datePersons.map(person => person.id === id ? updatedPerson : person));
    }
    setEditingPerson(null);
    
    if (isLoggedIn && dataMode === 'cloud' && updatedPerson) {
      try {
        const user = await getCurrentUser();
        if (user) {
          const result = await updateInCloud(updatedPerson, user.id);
          if (!result.success) {
            showSyncNotification('error', `自動同步失敗：${result.message}`);
          }
        }
      } catch (error) {
        console.error('自動同步更新數據失敗:', error);
        showSyncNotification('error', '自動同步更新數據失敗，請稍後手動同步');
      }
    }
  };
  
  const handleDeletePerson = (id: string) => {
    setPersonToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (personToDelete) {
      deleteDatePerson(personToDelete);
      setDatePersons(datePersons.filter(person => person.id !== personToDelete));
      setShowDeleteConfirm(false);
      
      if (isLoggedIn && dataMode === 'cloud') {
        try {
          const user = await getCurrentUser();
          if (user) {
            const result = await deleteFromCloud(personToDelete, user.id);
            if (!result.success) {
              showSyncNotification('error', `自動同步失敗：${result.message}`);
            }
          }
        } catch (error) {
          console.error('自動同步刪除數據失敗:', error);
          showSyncNotification('error', '自動同步刪除數據失敗，請稍後手動同步');
        }
      }
      
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
        
        {syncMessage.type === 'info' && syncMessage.onConfirm && (
          <div className="mt-3 flex justify-end gap-2">
            <button 
              onClick={closeSyncMessage}
              className="px-3 py-1 rounded-md bg-gray-800 text-white text-sm"
            >
              取消
            </button>
            <button 
              onClick={() => {
                if (syncMessage.onConfirm) {
                  syncMessage.onConfirm();
                }
                closeSyncMessage();
              }}
              className="px-3 py-1 rounded-md bg-primary text-black text-sm font-medium"
            >
              確認
            </button>
          </div>
        )}
      </div>
    );
  };
  
  useEffect(() => {
    const checkAndPromptSync = async () => {
      const user = await getCurrentUser();
      if (user && datePersons.length > 0) {
        const hasCloudDataResult = await hasCloudData(user.id);
        
        if (!hasCloudDataResult) {
          console.log('檢測到登入用戶有本地數據但無雲端數據，顯示同步提示');
          setShowSyncConfirm(true);
        }
      }
    };
    
    checkAndPromptSync();
  }, [datePersons.length]);
  
  const confirmSyncModeChange = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return;
      }
      
      setIsLoading(true);
      
      // 檢查用戶是否已有雲端數據
      const hasCloud = await hasCloudData(user.id);
      
      if (hasCloud) {
        // 如果有雲端數據，需要合併
        const { success, data, message } = await mergeLocalAndCloudData(user.id);
        
        if (success) {
          // 更新本地顯示的數據
          if (data) setDatePersons(data);
          
          // 切換到雲端模式
          setDataMode('cloud');
          localStorage.setItem('dataMode', 'cloud');
          
          showSyncNotification('success', message);
        } else {
          showSyncNotification('error', message);
        }
      } else {
        // 如果沒有雲端數據，直接遷移
        const result = await migrateLocalDataToCloud(user.id);
        
        if (result.success) {
          // 切換到雲端模式
          setDataMode('cloud');
          localStorage.setItem('dataMode', 'cloud');
          
          showSyncNotification('success', result.message);
        } else {
          showSyncNotification('error', result.message);
        }
      }
    } catch (error) {
      showSyncNotification('error', '同步過程中發生錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
      setShowSyncConfirm(false);
    }
  };

  // 處理用戶登入事件
  const handleUserLogin = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        
        // 檢查是否有雲端數據
        const hasCloud = await hasCloudData(user.id);
        
        if (hasCloud) {
          // 如果有雲端數據，詢問是否切換到雲端模式
          showSyncNotification('info', '發現雲端數據。是否要切換到雲端模式？', () => {
            setDataMode('cloud');
            localStorage.setItem('dataMode', 'cloud');
            loadCloudData(user.id);
          });
        } else if (datePersons.length > 0) {
          // 如果沒有雲端數據但有本地數據，詢問是否同步到雲端
          setShowSyncConfirm(true);
        }
      }
    } catch (error) {
      // 錯誤處理
    }
  }, [datePersons.length, loadCloudData, showSyncNotification]);

  // 監視用戶登入狀態變化
  useEffect(() => {
    if (isLoggedIn) {
      handleUserLogin();
    }
  }, [isLoggedIn, handleUserLogin]);

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
        onClose={() => {
          setShowLoginModal(false);
          // 登入對話框關閉後，檢查登入狀態
          handleUserLogin();
        }} 
      />
      
      {renderSyncNotification()}
      
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="w-full max-w-md p-6 mx-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">同步資料</h2>
              <button
                onClick={() => setShowSyncConfirm(false)}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">
              檢測到您的本地已有 <span className="font-bold text-primary">{datePersons.length}</span> 筆約會記錄。
            </p>
            <p className="text-gray-400 mb-6">
              是否要將這些資料同步到雲端，以便在其他裝置上訪問？
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSyncConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
                disabled={isLoading}
              >
                稍後再說
              </button>
              <button
                onClick={confirmSyncModeChange}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    同步中...
                  </>
                ) : (
                  '同步到雲端'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
