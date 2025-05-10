import { createClient } from '@supabase/supabase-js';

// 環境變數應該在 .env.local 文件中定義
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 檢查環境變量是否已設置
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase環境變量未設置。請確保已設置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。');
  }
}

// 創建 Supabase 客戶端
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true
    }
  }
);

// 檢查當前用戶會話
export const getCurrentUser = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('獲取當前用戶失敗:', error);
    return null;
  }
};

// 發送魔術連結登入
export const signInWithEmail = async (email: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: { message: 'Supabase環境變量未設置' } };
  }
  
  try {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  } catch (error) {
    console.error('發送登入鏈接失敗:', error);
    return { error };
  }
};

// 登出
export const signOut = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('登出失敗:', error);
    return { error };
  }
};

// 獲取當前會話
export const getSession = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { session: null, error: { message: 'Supabase環境變量未設置' } };
    }
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  } catch (error) {
    console.error('獲取會話失敗:', error);
    return { session: null, error };
  }
}; 