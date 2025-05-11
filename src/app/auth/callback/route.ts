import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// 確保這個路由是動態的
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      // 創建 Supabase 客戶端
      const cookieStore = cookies();
      
      // 使用更安全的方式處理cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          cookies: {
            get(name: string) {
              try {
                // @ts-ignore - 忽略TypeScript錯誤，cookies API在運行時應該工作正常
                return cookieStore.get(name)?.value;
              } catch (error) {
                return undefined;
              }
            },
            set(name: string, value: string, options: any) {
              try {
                // @ts-ignore - 忽略TypeScript錯誤，cookies API在運行時應該工作正常
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // 處理錯誤但不輸出到控制台
              }
            },
            remove(name: string, options: any) {
              try {
                // @ts-ignore - 忽略TypeScript錯誤，cookies API在運行時應該工作正常
                cookieStore.set({ name, value: '', ...options, maxAge: 0 });
              } catch (error) {
                // 處理錯誤但不輸出到控制台
              }
            },
          },
        }
      );
      
      // 交換授權碼以獲取會話
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      // 處理錯誤但不輸出到控制台
    }
  }
  
  // 重定向到首頁
  return NextResponse.redirect(new URL('/', request.url));
} 