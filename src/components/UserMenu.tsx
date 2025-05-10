import { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaUserCircle, FaCloudUploadAlt, FaCloud, FaDesktop } from 'react-icons/fa';
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
  
  // 獲取當前用戶
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('獲取用戶信息失敗:', error);
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
      console.error('登出失敗:', error);
    }
  };
  
  // 簡化郵箱顯示
  const formatEmail = (email: string) => {
    if (email.length <= 15) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 6) return email;
    return `${name.slice(0, 6)}...@${domain}`;
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
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary hover:bg-primary-dark text-white rounded-full transition-colors"
      >
        <FaUser size={14} />
        <span>登入</span>
      </button>
    );
  }
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
      >
        <FaUserCircle size={16} />
        <span>{user.email ? formatEmail(user.email) : '用戶'}</span>
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
          <div className="p-4 border-b border-gray-800">
            <div className="text-sm text-gray-400">已登入為</div>
            <div className="font-medium truncate">{user.email}</div>
          </div>
          
          <div className="p-2">
            <button
              onClick={onSyncData}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
            >
              {dataMode === 'local' ? (
                <>
                  <FaCloudUploadAlt size={16} className="text-primary" />
                  <span>同步數據到雲端</span>
                </>
              ) : (
                <>
                  <FaCloud size={16} className="text-primary" />
                  <span>同步狀態: 已啟用</span>
                </>
              )}
            </button>
            
            {dataMode === 'cloud' && (
              <button
                onClick={() => {}} // 這裡可以添加切換到本地模式的功能
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                <FaDesktop size={16} />
                <span>切換到本地模式</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-800 rounded-md transition-colors text-red-400"
            >
              <FaSignOutAlt size={16} />
              <span>登出</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 