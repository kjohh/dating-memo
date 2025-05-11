import { DatePerson } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dating-memo-data';

// 檢查localStorage是否可用
const isLocalStorageAvailable = () => {
  try {
    const testKey = 'test-storage';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// 獲取所有約會對象
export const getAllDatePersons = (): DatePerson[] => {
  if (typeof window === 'undefined') return [];
  
  if (!isLocalStorageAvailable()) {
    return [];
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) return [];
    
    const parsedData = JSON.parse(data);
    
    // 轉換日期字符串為Date對象
    return parsedData.map((person: Omit<DatePerson, 'meetDate' | 'createdAt' | 'updatedAt'> & {
      meetDate?: string;
      createdAt: string;
      updatedAt: string;
    }) => ({
      ...person,
      meetDate: person.meetDate ? new Date(person.meetDate) : undefined,
      createdAt: new Date(person.createdAt),
      updatedAt: new Date(person.updatedAt),
    }));
  } catch (error) {
    return [];
  }
};

// 獲取單個約會對象
export const getDatePerson = (id: string): DatePerson | undefined => {
  const allPersons = getAllDatePersons();
  const person = allPersons.find(person => person.id === id);
  return person;
};

// 添加新的約會對象
export const addDatePerson = (personData: Omit<DatePerson, 'id' | 'createdAt' | 'updatedAt'>): DatePerson => {
  const now = new Date();
  const newPerson: DatePerson = {
    ...personData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  const allPersons = getAllDatePersons();
  const updatedPersons = [...allPersons, newPerson];
  
  const saved = saveDatePersons(updatedPersons);
  if (!saved) {
    throw new Error('保存數據失敗');
  }
  
  return newPerson;
};

// 更新約會對象
export const updateDatePerson = (id: string, personData: Partial<Omit<DatePerson, 'id' | 'createdAt' | 'updatedAt'>>): DatePerson | undefined => {
  const allPersons = getAllDatePersons();
  const personIndex = allPersons.findIndex(person => person.id === id);
  
  if (personIndex === -1) {
    return undefined;
  }
  
  const updatedPerson: DatePerson = {
    ...allPersons[personIndex],
    ...personData,
    updatedAt: new Date(),
  };
  
  allPersons[personIndex] = updatedPerson;
  const saved = saveDatePersons(allPersons);
  
  if (!saved) {
    throw new Error('保存數據失敗');
  }
  
  return updatedPerson;
};

// 刪除約會對象
export const deleteDatePerson = (id: string): boolean => {
  const allPersons = getAllDatePersons();
  const updatedPersons = allPersons.filter(person => person.id !== id);
  
  if (updatedPersons.length === allPersons.length) {
    return false; // 沒有找到要刪除的對象
  }
  
  const saved = saveDatePersons(updatedPersons);
  if (!saved) {
    throw new Error('保存數據失敗');
  }
  
  return true;
};

// 保存所有約會對象到本地存儲
const saveDatePersons = (persons: DatePerson[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    const dataToSave = JSON.stringify(persons);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    
    // 驗證保存是否成功
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return false;
    }
    
    // 發送事件通知其他標籤頁
    window.dispatchEvent(new Event('storage'));
    
    return true;
  } catch (error) {
    return false;
  }
}; 