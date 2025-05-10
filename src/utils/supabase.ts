import { createClient } from '@supabase/supabase-js';

// 環境變數應該在 .env.local 文件中定義
// 這裡先使用佔位符
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 檢查當前用戶會話
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// 發送魔術連結登入
export const signInWithEmail = async (email: string) => {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

// 登出
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// 獲取當前會話
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}; 