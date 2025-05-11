import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaUser, FaSignOutAlt, FaUserCircle, FaCloudUploadAlt, FaCloud } from 'react-icons/fa';
import { getCurrentUser, signOut } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

interface UserMenuProps {
  onLoginClick: () => void;
  onSyncData: () => void;
  dataMode: 'local' | 'cloud';
}

const UserMenu = ({ onLoginClick, onSyncData, dataMode }: UserMenuProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // 獲取當前用戶
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // 處理錯誤但不輸出到控制台
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // 處理點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 處理登出
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsMenuOpen(false);
      // 可能需要執行一些清理操作，例如切換回本地存儲模式
    } catch (error) {
      // 處理錯誤但不輸出到控制台
    }
  };
  
  // 簡化郵箱顯示
  const formatEmail = (email: string) => {
    if (email.length <= 15) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 6) return email;
    return `${name.slice(0, 6)}...@${domain}`;
  };
  
  // 獲取按鈕位置用於定位彈出選單
  const getMenuPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 8, // 按鈕底部 + 滾動偏移 + 間距
      right: window.innerWidth - rect.right, // 視窗右側到按鈕右側的距離
    };
  };
  
  // 渲染選單彈出框
  const renderMenu = () => {
    if (!isMenuOpen) return null;
    
    const { top, right } = getMenuPosition();
    
    const menuContent = (
      <div 
        className="fixed w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-[999]"
        style={{ top: `${top}px`, right: `${right}px` }}
        ref={menuRef}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="text-sm text-gray-400">已登入為</div>
          <div className="font-medium truncate">{user?.email}</div>
        </div>
        
        <div className="p-2">
          <button
            onClick={onSyncData}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
          >
            <FaCloud size={16} className="text-primary" />
            <span>同步數據</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-md transition-colors text-red-400"
          >
            <FaSignOutAlt size={16} />
            <span>登出</span>
          </button>
        </div>
      </div>
    );
    
    // 使用Portal將選單渲染到body上
    return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : null;
  };
  
  if (loading) {
    return (
      <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
        <FaUserCircle size={24} className="text-gray-400" />
      </button>
    );
  }
  
  if (!user) {
    return (
      <button 
        onClick={onLoginClick}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary hover:bg-primary-dark text-black rounded-full transition-colors"
      >
        <FaUser size={14} />
        <span>登入</span>
      </button>
    );
  }
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
      >
        <FaUserCircle size={16} />
        <span>{user.email ? formatEmail(user.email) : '用戶'}</span>
      </button>
      
      {renderMenu()}
    </div>
  );
};

export default UserMenu; 