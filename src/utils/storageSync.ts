import { supabase } from './supabase';
import { getAllDatePersons } from './storage';
import { DatePerson } from '@/types';

// 檢查Supabase環境變數
const isSuapabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
};

// 實際表名
const TABLE_NAME = 'dating_persons';

// 輔助函數：將本地資料格式化為雲端格式
const formatForCloud = (person: DatePerson, userId: string) => {
  return {
    id: person.id,
    user_id: userId,
    name: person.name,
    gender: person.gender,
    meetChannel: person.meetChannel,
    relationshipStatus: person.relationshipStatus,
    positiveTags: person.positiveTags,
    negativeTags: person.negativeTags,
    personalityTags: person.personalityTags,
    notes: person.notes,
    age: person.age,
    occupation: person.occupation,
    contactInfo: person.contactInfo,
    instagramAccount: person.instagramAccount,
    rating: person.rating,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
    firstDateAt: person.firstDateAt || null
  };
};

// 將一個新的約會對象添加到雲端
export const addToCloud = async (person: DatePerson, userId: string) => {
  if (!isSuapabaseConfigured()) {
    return { success: false, message: '未配置Supabase環境變數，無法連接雲端' };
  }
  
  try {
    const formattedPerson = formatForCloud(person, userId);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(formattedPerson);
    
    if (error) {
      return { success: false, message: `添加失敗: ${error.message}` };
    }
    
    return { success: true, message: '成功添加到雲端' };
  } catch (error) {
    return { success: false, message: '添加過程中發生錯誤' };
  }
};

// 更新雲端中的約會對象
export const updateInCloud = async (person: DatePerson, userId: string) => {
  if (!isSuapabaseConfigured()) {
    return { success: false, message: '未配置Supabase環境變數，無法連接雲端' };
  }
  
  try {
    const formattedPerson = formatForCloud(person, userId);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(formattedPerson)
      .eq('id', person.id);
    
    if (error) {
      return { success: false, message: `更新失敗: ${error.message}` };
    }
    
    return { success: true, message: '成功更新雲端數據' };
  } catch (error) {
    return { success: false, message: '更新過程中發生錯誤' };
  }
};

// 從雲端刪除約會對象
export const deleteFromCloud = async (personId: string, userId: string) => {
  if (!isSuapabaseConfigured()) {
    return { success: false, message: '未配置Supabase環境變數，無法連接雲端' };
  }
  
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', personId)
      .eq('user_id', userId);
    
    if (error) {
      return { success: false, message: `刪除失敗: ${error.message}` };
    }
    
    return { success: true, message: '成功從雲端刪除' };
  } catch (error) {
    return { success: false, message: '刪除過程中發生錯誤' };
  }
};

// 將本地數據遷移到雲端
export const migrateLocalDataToCloud = async (userId: string) => {
  if (!isSuapabaseConfigured()) {
    return { success: false, message: '未配置Supabase環境變數，無法連接雲端' };
  }
  
  try {
    // 獲取本地數據
    const localData = getAllDatePersons();
    
    if (localData.length === 0) {
      return { success: true, message: '無本地數據需要遷移' };
    }
    
    // 將本地數據格式轉換為 Supabase 格式，添加用戶 ID
    const formattedData = localData.map(person => formatForCloud(person, userId));
    
    // 上傳數據到 Supabase
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(formattedData);
    
    if (error) {
      return { success: false, message: `遷移失敗: ${error.message}` };
    }
    
    return { success: true, message: `成功遷移 ${localData.length} 筆數據到雲端` };
  } catch (error) {
    return { success: false, message: '遷移過程中發生錯誤' };
  }
};

// 從雲端獲取數據
export const fetchCloudData = async (userId: string) => {
  if (!isSuapabaseConfigured()) {
    return { success: false, data: [], message: '未配置Supabase環境變數，無法連接雲端' };
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      return { success: false, data: [], message: `獲取失敗: ${error.message}` };
    }
    
    // 將數據格式轉換為應用期望的格式
    const formattedData: DatePerson[] = data.map(item => ({
      id: item.id,
      name: item.name,
      gender: item.gender,
      meetChannel: item.meetChannel,
      relationshipStatus: item.relationshipStatus,
      positiveTags: item.positiveTags || [],
      negativeTags: item.negativeTags || [],
      personalityTags: item.personalityTags || [],
      notes: item.notes,
      age: item.age,
      occupation: item.occupation,
      contactInfo: item.contactInfo,
      instagramAccount: item.instagramAccount,
      rating: item.rating,
      // 使用駝峰式命名法的字段
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      firstDateAt: item.firstDateAt
    }));
    
    return { success: true, data: formattedData, message: '獲取雲端數據成功' };
  } catch (error) {
    return { success: false, data: [], message: '獲取雲端數據過程中發生錯誤' };
  }
};

// 檢查用戶是否有雲端數據
export const hasCloudData = async (userId: string) => {
  if (!isSuapabaseConfigured()) {
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      return false;
    }
    
    return data.length > 0;
  } catch (error) {
    return false;
  }
};

// 合併本地和雲端數據（基於最後更新時間）
export const mergeLocalAndCloudData = async (userId: string) => {
  try {
    // 獲取本地數據
    const localData = getAllDatePersons();
    
    // 獲取雲端數據
    const { data: cloudData, success, message } = await fetchCloudData(userId);
    
    if (!success || !cloudData) {
      return { success: false, message: `無法獲取雲端數據: ${message}` };
    }
    
    // 建立 ID 到數據的映射
    const dataMap = new Map();
    
    // 先添加雲端數據
    cloudData.forEach(item => {
      dataMap.set(item.id, item);
    });
    
    // 合併本地數據，如果本地更新時間較新則覆蓋
    localData.forEach(item => {
      const cloudItem = dataMap.get(item.id);
      
      // 如果雲端沒有此數據，或本地數據更新時間較新，則使用本地數據
      if (!cloudItem) {
        dataMap.set(item.id, item);
      } else if (item.updatedAt > cloudItem.updatedAt) {
        dataMap.set(item.id, item);
      }
    });
    
    // 將合併結果轉換為數組
    const mergedData = Array.from(dataMap.values());
    
    // 準備用於上傳的數據
    const uploadData = mergedData.map(item => formatForCloud(item, userId));
    
    // 清空現有雲端數據
    const { error: deleteError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      return { success: false, message: `刪除舊數據失敗: ${deleteError.message}` };
    }
    
    // 上傳合併後的數據
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(uploadData);
    
    if (error) {
      return { success: false, message: `合併失敗: ${error.message}` };
    }
    
    return { 
      success: true, 
      data: mergedData,
      message: `成功合併 ${mergedData.length} 筆數據`
    };
  } catch (error) {
    return { 
      success: false, 
      message: '合併過程中發生錯誤，請稍後再試'
    };
  }
}; 