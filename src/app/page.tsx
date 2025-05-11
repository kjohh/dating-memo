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
          try {
            // 檢查本地存儲的數據模式
            const storedDataMode = localStorage.getItem('dataMode');
            
            // 檢查是否有雲端數據
            const hasCloud = await hasCloudData(user.id);
            
            // 如果用戶已經選擇了雲端模式，直接使用
            if (storedDataMode === 'cloud') {
              setDataMode('cloud');
              loadCloudData(user.id).catch(err => {
                // 如果雲端數據加載失敗，回退到本地模式
                setDataMode('local');
                localStorage.setItem('dataMode', 'local');
                showSyncNotification('error', '無法連接雲端，已切換到本地模式');
              });
            } 
            // 如果有雲端數據但用戶沒有明確選擇過數據模式，才顯示提示
            else if (hasCloud && !storedDataMode) {
              showSyncNotification('info', '發現雲端數據。是否要切換到雲端模式？', () => {
                setDataMode('cloud');
                localStorage.setItem('dataMode', 'cloud');
                loadCloudData(user.id).catch(err => {
                  // 如果雲端數據加載失敗，回退到本地模式
                  setDataMode('local');
                  localStorage.setItem('dataMode', 'local');
                  showSyncNotification('error', '無法連接雲端，已切換到本地模式');
                });
              });
            }
            // 如果用戶明確選擇了本地模式，尊重用戶選擇
            else if (storedDataMode === 'local') {
              setDataMode('local');
            }
          } catch (cloudError) {
            // 如果無法檢查雲端數據，默認使用本地模式
            setDataMode('local');
            localStorage.setItem('dataMode', 'local');
          }
        }
      } catch (error) {
        // 在登入檢查失敗時，確保使用本地模式
        setDataMode('local');
        localStorage.setItem('dataMode', 'local');
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
  
  const loadCloudData = async (userId: string, silent = false) => {
    if (!silent) {
      showSyncNotification('info', '正在載入雲端數據...');
    }
    
    try {
      // 從雲端載入數據
      const { data, success, message } = await fetchCloudData(userId);
      
      if (success && data) {
        setDatePersons(data);
        if (!silent) {
          showSyncNotification('success', `成功從雲端載入 ${data.length} 筆數據`);
        }
        return { success: true };
      } else {
        if (!silent) {
          showSyncNotification('error', `加載雲端數據失敗: ${message}`);
        }
        return { success: false, error: message };
      }
    } catch (error) {
      if (!silent) {
        showSyncNotification('error', '加載雲端數據時出錯');
      }
      return { success: false, error: '加載過程中出錯' };
    }
  };
  
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
        // 已經在雲端模式
        loadCloudData(user.id);
        showSyncNotification('success', '已重新載入雲端數據');
      }
    } catch (error) {
      showSyncNotification('error', '同步數據失敗，請稍後再試');
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
      if (isLoggedIn && dataMode === 'cloud') {
        showSyncNotification('info', '正在同步到雲端...');
        setIsLoading(true);
        
        try {
          const user = await getCurrentUser();
          
          if (user) {
            // 嘗試添加到雲端
            const result = await addToCloud(newPerson, user.id);
            
            if (result.success) {
              // 雲端添加成功
              showSyncNotification('success', '新增記錄已同步到雲端');
              
              // 從雲端重新獲取最新數據，確保本地與雲端一致
              setTimeout(() => {
                loadCloudData(user.id, true);
              }, 800); // 增加延遲，確保雲端數據已更新
            } else {
              // 雲端添加失敗
              showSyncNotification('error', `自動同步失敗：${result.message}`);
            }
          }
        } catch (error) {
          showSyncNotification('error', '自動同步新增數據失敗，請稍後手動同步');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 在本地模式下顯示成功訊息
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
      if (isLoggedIn && dataMode === 'cloud') {
        showSyncNotification('info', '正在同步更改到雲端...');
        setIsLoading(true);
        
        try {
          const user = await getCurrentUser();
          
          if (user) {
            // 嘗試更新雲端數據
            const result = await updateInCloud(updatedPerson, user.id);
            
            if (result.success) {
              // 雲端更新成功
              showSyncNotification('success', '更新已同步到雲端');
              
              // 從雲端重新獲取最新數據，確保本地與雲端一致
              setTimeout(() => {
                loadCloudData(user.id, true);
              }, 800); // 增加延遲，確保雲端數據已更新
            } else {
              // 雲端更新失敗
              showSyncNotification('error', `自動同步失敗：${result.message}`);
            }
          }
        } catch (error) {
          showSyncNotification('error', '自動同步更新數據失敗，請稍後手動同步');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 在本地模式下顯示成功訊息
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
        if (isLoggedIn && dataMode === 'cloud') {
          showSyncNotification('info', '正在同步到雲端...');
          setIsLoading(true);
          
          try {
            const user = await getCurrentUser();
            
            if (user) {
              // 嘗試從雲端刪除
              const result = await deleteFromCloud(personToDelete, user.id);
              
              if (result.success) {
                // 雲端刪除成功
                showSyncNotification('success', '刪除操作已同步到雲端');
                
                // 從雲端重新獲取最新數據，確保本地與雲端一致
                setTimeout(() => {
                  loadCloudData(user.id, true);
                }, 800); // 增加延遲，確保雲端數據已更新
              } else {
                // 雲端刪除失敗
                showSyncNotification('error', `自動同步失敗：${result.message}`);
              }
            }
          } catch (error) {
            showSyncNotification('error', '自動同步刪除數據失敗，請稍後手動同步');
          } finally {
            setIsLoading(false);
          }
        } else {
          // 在本地模式下顯示成功訊息
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
  
  useEffect(() => {
    const checkAndPromptSync = async () => {
      // 如果用戶已登入且使用本地數據模式
      if (isLoggedIn && dataMode === 'local') {
        try {
          const user = await getCurrentUser();
          if (!user) return;
          
          // 檢查本地是否有數據
          const hasLocalData = datePersons.length > 0;
          
          // 檢查雲端是否已有數據
          const hasCloud = await hasCloudData(user.id);
          
          // 如果本地有數據但雲端沒有，提示同步
          if (hasLocalData && !hasCloud) {
            // 檢測到登入用戶有本地數據但無雲端數據，顯示同步提示
            setShowSyncConfirm(true);
          }
        } catch (error) {
          // 處理錯誤
        }
      }
    };
    
    checkAndPromptSync();
  }, [datePersons.length, isLoggedIn, dataMode]);
  
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

  // 修改用戶登入事件處理函數
  const handleUserLogin = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        
        // 檢查本地存儲的數據模式
        const storedDataMode = localStorage.getItem('dataMode');
        
        // 只有在沒有明確設定數據模式的情況下才檢查雲端數據並提示
        if (!storedDataMode) {
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
        // 如果用戶已經選擇了雲端模式，直接加載雲端數據
        else if (storedDataMode === 'cloud') {
          setDataMode('cloud');
          loadCloudData(user.id);
        }
      }
    } catch (error) {
      // 處理錯誤但不輸出到控制台
    }
  }, [datePersons.length, loadCloudData, showSyncNotification, hasCloudData]);
  
  // 監視用戶登入狀態變化
  useEffect(() => {
    if (isLoggedIn) {
      handleUserLogin();
    }
  }, [isLoggedIn, handleUserLogin]);

  // 清除同步消息
  useEffect(() => {
    return () => {
      // 組件卸載時清除任何顯示中的同步通知
      if (syncMessage.show) {
        setSyncMessage(prev => ({ ...prev, show: false }));
      }
    };
  }, [syncMessage.show]);

  // 添加定期自動同步機制
  useEffect(() => {
    // 只有當用戶登入且使用雲端模式時啟用自動同步
    if (isLoggedIn && dataMode === 'cloud') {
      // 自動同步間隔（毫秒）
      const syncIntervalTime = 5 * 60 * 1000; // 5分鐘
      
      // 啟用自動同步機制
      
      // 定義同步函數
      const syncNow = async () => {
        try {
          // 執行自動同步...
          const user = await getCurrentUser();
          if (user) {
            await loadCloudData(user.id, true); // 靜默加載，不顯示通知
          }
        } catch (error) {
          // 自動同步失敗處理
        }
      };
      
      // 設置定時器，定期同步
      const intervalId = setInterval(syncNow, syncIntervalTime);
      
      // 監聽窗口獲得焦點事件，在用戶回到頁面時同步
      const handleFocus = () => {
        // 頁面獲得焦點，執行同步
        syncNow();
      };
      
      window.addEventListener('focus', handleFocus);
      
      // 清理函數
      return () => {
        // 停止自動同步
        clearInterval(intervalId);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isLoggedIn, dataMode]);

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
