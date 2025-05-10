import { supabase } from './supabase';
import { getAllDatePersons } from './storage';
import { DatePerson } from '@/types';

// 實際表名
const TABLE_NAME = 'dating_persons';

// 將本地數據遷移到雲端
export const migrateLocalDataToCloud = async (userId: string) => {
  try {
    // 獲取本地數據
    const localData = getAllDatePersons();
    
    if (localData.length === 0) {
      return { success: true, message: '無本地數據需要遷移' };
    }
    
    console.log('正在遷移本地數據到雲端:', localData.length, '條記錄');
    
    // 將本地數據格式轉換為 Supabase 格式，添加用戶 ID
    const formattedData = localData.map(person => {
      // 創建一個新對象以確保字段名稱與 Supabase 表結構一致
      const formattedPerson = {
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
        // 注意：使用駝峰式命名法而不是蛇形命名法
        createdAt: person.createdAt.toISOString(),
        updatedAt: person.updatedAt.toISOString(),
        firstDateAt: person.firstDateAt || null
      };
      
      console.log('格式化數據:', formattedPerson);
      return formattedPerson;
    });
    
    // 上傳數據到 Supabase
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(formattedData);
    
    if (error) {
      console.error('遷移數據到雲端失敗:', error);
      return { success: false, message: `遷移失敗: ${error.message}` };
    }
    
    return { success: true, message: `成功遷移 ${localData.length} 筆數據到雲端` };
  } catch (error) {
    console.error('遷移數據出錯:', error);
    return { success: false, message: '遷移過程中發生錯誤' };
  }
};

// 從雲端獲取數據
export const fetchCloudData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('獲取雲端數據失敗:', error);
      return { success: false, data: [], message: `獲取失敗: ${error.message}` };
    }
    
    console.log('從雲端獲取的原始數據:', data);
    
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
    console.error('獲取雲端數據出錯:', error);
    return { success: false, data: [], message: '獲取雲端數據過程中發生錯誤' };
  }
};

// 檢查用戶是否有雲端數據
export const hasCloudData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('檢查雲端數據失敗:', error);
      return false;
    }
    
    return data.length > 0;
  } catch (error) {
    console.error('檢查雲端數據出錯:', error);
    return false;
  }
};

// 合併本地和雲端數據（基於最後更新時間）
export const mergeLocalAndCloudData = async (userId: string) => {
  // 獲取本地數據
  const localData = getAllDatePersons();
  
  // 獲取雲端數據
  const { data: cloudData } = await fetchCloudData(userId);
  
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
    if (!cloudItem || item.updatedAt > cloudItem.updatedAt) {
      dataMap.set(item.id, item);
    }
  });
  
  // 將合併結果轉換為數組
  const mergedData = Array.from(dataMap.values());
  
  // 準備用於上傳的數據
  const uploadData = mergedData.map(item => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    gender: item.gender,
    meetChannel: item.meetChannel,
    relationshipStatus: item.relationshipStatus,
    positiveTags: item.positiveTags,
    negativeTags: item.negativeTags,
    personalityTags: item.personalityTags,
    notes: item.notes,
    age: item.age,
    occupation: item.occupation,
    contactInfo: item.contactInfo,
    instagramAccount: item.instagramAccount,
    rating: item.rating,
    // 使用駝峰式命名法的字段
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    firstDateAt: item.firstDateAt || null
  }));
  
  // 清空現有雲端數據
  await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('user_id', userId);
  
  // 上傳合併後的數據
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert(uploadData);
  
  if (error) {
    console.error('合併數據到雲端失敗:', error);
    return { success: false, message: `合併失敗: ${error.message}` };
  }
  
  return { 
    success: true, 
    data: mergedData,
    message: `成功合併 ${mergedData.length} 筆數據`
  };
}; 