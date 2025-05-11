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

// 確保首頁也是動態的，避免在構建時預渲染失敗
export const dynamic = 'force-dynamic';

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
  const [syncMessage, setSyncMessage] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
    onConfirm?: () => void;
  }>({ show: false, type: 'info', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  // 上次顯示通知的時間戳
  const lastNotificationRef = useRef<{
    timestamp: number;
    type: string;
    message: string;
  }>({ timestamp: 0, type: '', message: '' });

  const closeSyncMessage = () => {
    setSyncMessage(prev => ({ ...prev, show: false }));
  };
  
  const showSyncNotification = useCallback((type: 'success' | 'error' | 'info', message: string, onConfirm?: () => void) => {
    // 不顯示雲端載入相關的靜默通知
    if (message.includes('載入雲端數據') || message.includes('成功從雲端載入')) {
      return;
    }
    
    // 只顯示錯誤通知和必要的用戶操作通知
    if (type === 'error' || message.includes('同步完成') || onConfirm) {
      // 更新上次通知信息
      lastNotificationRef.current = {
        timestamp: Date.now(),
        type,
        message
      };
      
      setSyncMessage({
        show: true,
        type,
        message,
        onConfirm
      });
      
      if (type !== 'info' || (type === 'info' && !onConfirm)) {
        setTimeout(() => {
          setSyncMessage(prev => ({ ...prev, show: false }));
        }, 5000);
      }
    }
  }, []);
  
  const loadCloudData = useCallback(async (userId: string) => {
    // 防止重複加載
    if (isCloudLoading) return [];
    
    setIsCloudLoading(true);
    
    try {
      // 從雲端載入數據
      const { data, success, message } = await fetchCloudData(userId);
      
      if (success && data) {
        setDatePersons(data);
        return data; // 返回實際數據而不是狀態對象
      } else {
        // 只有在失敗時才顯示通知
        showSyncNotification('error', `無法連接雲端數據庫: ${message}`);
        return []; // 返回空數組
      }
    } catch (error) {
      showSyncNotification('error', '載入數據時出錯');
      return []; // 返回空數組
    } finally {
      setIsCloudLoading(false);
    }
  }, [isCloudLoading, showSyncNotification]);
  
  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn) {
        try {
          const user = await getCurrentUser();
          if (user) {
            await loadCloudData(user.id);
          }
        } catch (error) {
          // 處理錯誤但不輸出到控制台
          const data = getAllDatePersons();
          setDatePersons(data);
        }
      } else {
        const data = getAllDatePersons();
        setDatePersons(data);
      }
    };

    loadData();
    
    window.addEventListener('storage', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, [isLoggedIn, loadCloudData]);

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

  const autoMergeAndSync = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // 獲取本地數據
      const localData = getAllDatePersons();
      
      // 檢查雲端是否有數據
      const hasCloud = await hasCloudData(userId);
      
      if (hasCloud) {
        // 如果雲端有數據，執行合併
        const { success, data } = await mergeLocalAndCloudData(userId);
        
        if (success && data) {
          setDatePersons(data);
          // 只在合併成功後顯示一次通知
          if (localData.length > 0) {
            showSyncNotification('success', '本地與雲端數據已合併完成');
          }
        }
      } else if (localData.length > 0) {
        // 如果雲端沒有數據但本地有數據，將本地數據上傳到雲端
        const result = await migrateLocalDataToCloud(userId);
        
        if (result.success) {
          // 不顯示通知，保持無縫體驗
        }
      }
    } catch (error) {
      // 只在出錯時顯示通知
      showSyncNotification('error', '同步過程中發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [showSyncNotification, setDatePersons, setIsLoading]);
  
  const checkLoginStatus = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const wasLoggedIn = isLoggedIn;
      setIsLoggedIn(!!user);
      
      if (user && !wasLoggedIn) {
        // 用戶剛登入，自動執行合併和同步
        await autoMergeAndSync(user.id);
      }
    } catch (error) {
      // 處理錯誤但不顯示通知
    }
  }, [isLoggedIn, autoMergeAndSync, setIsLoggedIn]);
  
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);
  
  const handleUserLogin = useCallback(async () => {
    const user = await getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      // 自動執行合併和同步
      await autoMergeAndSync(user.id);
    }
  }, [autoMergeAndSync, setIsLoggedIn]);
  
  const handleSyncData = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        setShowLoginModal(true);
        return;
      }
      
      showSyncNotification('info', '正在同步數據...');
      setIsLoading(true);
      
      // 自動執行合併和同步
      await autoMergeAndSync(user.id);
      
      showSyncNotification('success', '數據同步完成');
    } catch (error) {
      showSyncNotification('error', '同步數據失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = async (data: DatePersonFormData) => {
    try {
      // 在本地添加記錄
      const newPerson = addDatePerson(data);
      
      // 更新UI狀態
      setDatePersons(prevPersons => [...prevPersons, newPerson]);
      setShowAddForm(false);
      
      // 檢查是否需要同步到雲端
      if (isLoggedIn) {
        // 靜默同步，無需顯示通知
        setIsLoading(true);
        
        try {
          const user = await getCurrentUser();
          
          if (user) {
            // 嘗試添加到雲端
            const result = await addToCloud(newPerson, user.id);
            
            if (!result.success) {
              // 只在失敗時顯示通知
              showSyncNotification('error', `自動同步失敗：${result.message}`);
            }
            
            // 靜默重新載入數據以保持一致性
            setTimeout(() => {
              loadCloudData(user.id);
            }, 800);
          }
        } catch (error) {
          // 只在失敗時顯示通知
          showSyncNotification('error', '自動同步新增數據失敗');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 在未登入狀態下顯示成功訊息
        showSyncNotification('success', '資料已成功添加');
      }
    } catch (error) {
      showSyncNotification('error', '處理添加時發生錯誤');
    }
  };
  
  const handleEditPerson = async (id: string, data: DatePersonFormData) => {
    try {
      // 首先在本地更新數據
      const updatedPerson = updateDatePerson(id, data);
      if (!updatedPerson) {
        showSyncNotification('error', '更新失敗：找不到指定的記錄');
        return;
      }

      // 更新本地狀態
      setDatePersons(prevPersons => prevPersons.map(person => 
        person.id === id ? updatedPerson : person
      ));
      setEditingPerson(null);
      
      // 檢查是否需要同步到雲端
      if (isLoggedIn) {
        // 靜默同步，無需顯示通知
        setIsLoading(true);
        
        try {
          const user = await getCurrentUser();
          
          if (user) {
            // 嘗試更新雲端數據
            const result = await updateInCloud(updatedPerson, user.id);
            
            if (!result.success) {
              // 只在失敗時顯示通知
              showSyncNotification('error', `自動同步失敗：${result.message}`);
            }
            
            // 靜默重新載入數據以保持一致性
            setTimeout(() => {
              loadCloudData(user.id);
            }, 800);
          }
        } catch (error) {
          // 只在失敗時顯示通知
          showSyncNotification('error', '自動同步更新數據失敗');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 在未登入狀態下顯示成功訊息
        showSyncNotification('success', '資料已成功更新');
      }
    } catch (error) {
      showSyncNotification('error', '處理更新時發生錯誤');
    }
  };
  
  const handleDeletePerson = (id: string) => {
    setPersonToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (personToDelete) {
      try {
        // 本地刪除
        const success = deleteDatePerson(personToDelete);
        if (!success) {
          showSyncNotification('error', '刪除失敗：找不到指定的記錄');
          return;
        }
        
        // 更新UI狀態
        setDatePersons(prevPersons => prevPersons.filter(person => person.id !== personToDelete));
        setShowDeleteConfirm(false);
        
        // 檢查是否需要同步到雲端
        if (isLoggedIn) {
          // 靜默同步，無需顯示通知
          setIsLoading(true);
          
          try {
            const user = await getCurrentUser();
            
            if (user) {
              // 嘗試從雲端刪除
              const result = await deleteFromCloud(personToDelete, user.id);
              
              if (!result.success) {
                // 只在失敗時顯示通知
                showSyncNotification('error', `自動同步失敗：${result.message}`);
              }
              
              // 靜默重新載入數據以保持一致性
              setTimeout(() => {
                loadCloudData(user.id);
              }, 800);
            }
          } catch (error) {
            // 只在失敗時顯示通知
            showSyncNotification('error', '自動同步刪除數據失敗');
          } finally {
            setIsLoading(false);
          }
        } else {
          // 在未登入狀態下顯示成功訊息
          showSyncNotification('success', '記錄已成功刪除');
        }
        
        setPersonToDelete(null);
        setEditingPerson(null);
      } catch (error) {
        showSyncNotification('error', '處理刪除時發生錯誤');
      }
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

  // 添加自動同步功能
  useEffect(() => {
    // 只有當用戶登入時才啟用自動同步
    if (isLoggedIn) {
      // 自動同步間隔（毫秒）- 增加間隔時間避免頻繁同步
      const syncIntervalTime = 10 * 60 * 1000; // 10分鐘
      
      // 定義同步函數
      const syncNow = async () => {
        // 如果已在加載中，則跳過
        if (isCloudLoading) return;
        
        try {
          const user = await getCurrentUser();
          if (user) {
            await loadCloudData(user.id); // 靜默加載，不顯示通知
          }
        } catch (error) {
          // 自動同步失敗處理
        }
      };
      
      // 設置定時器，定期同步
      const intervalId = setInterval(syncNow, syncIntervalTime);
      
      // 頁面獲得焦點延遲處理變量
      let focusTimeoutId: NodeJS.Timeout | null = null;
      
      // 監聽窗口獲得焦點事件，在用戶回到頁面時同步，但添加防抖處理
      const handleFocus = () => {
        // 如果已有計時器，清除它
        if (focusTimeoutId) {
          clearTimeout(focusTimeoutId);
        }
        
        // 設置新的計時器，延遲執行同步
        focusTimeoutId = setTimeout(() => {
          // 只有當沒有加載進行中時才執行同步
          if (!isCloudLoading) {
            syncNow();
          }
          focusTimeoutId = null;
        }, 2000); // 2秒延遲
      };
      
      window.addEventListener('focus', handleFocus);
      
      // 清理函數
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
        if (focusTimeoutId) {
          clearTimeout(focusTimeoutId);
        }
      };
    }
  }, [isLoggedIn, isCloudLoading, loadCloudData]);

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
            dataMode={isLoggedIn ? 'cloud' : 'local'} 
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
    </main>
  );
}
