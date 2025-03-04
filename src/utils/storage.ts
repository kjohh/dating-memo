import { DatePerson } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dating-memo-data';

// 获取所有约会对象
export const getAllDatePersons = (): DatePerson[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsedData = JSON.parse(data);
    
    // 转换日期字符串为Date对象
    return parsedData.map((person: any) => ({
      ...person,
      meetDate: person.meetDate ? new Date(person.meetDate) : undefined,
      createdAt: new Date(person.createdAt),
      updatedAt: new Date(person.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return [];
  }
};

// 获取单个约会对象
export const getDatePerson = (id: string): DatePerson | undefined => {
  const allPersons = getAllDatePersons();
  return allPersons.find(person => person.id === id);
};

// 添加新的约会对象
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
  
  saveDatePersons(updatedPersons);
  return newPerson;
};

// 更新约会对象
export const updateDatePerson = (id: string, personData: Partial<Omit<DatePerson, 'id' | 'createdAt' | 'updatedAt'>>): DatePerson | undefined => {
  const allPersons = getAllDatePersons();
  const personIndex = allPersons.findIndex(person => person.id === id);
  
  if (personIndex === -1) return undefined;
  
  const updatedPerson: DatePerson = {
    ...allPersons[personIndex],
    ...personData,
    updatedAt: new Date(),
  };
  
  allPersons[personIndex] = updatedPerson;
  saveDatePersons(allPersons);
  
  return updatedPerson;
};

// 删除约会对象
export const deleteDatePerson = (id: string): boolean => {
  const allPersons = getAllDatePersons();
  const updatedPersons = allPersons.filter(person => person.id !== id);
  
  if (updatedPersons.length === allPersons.length) {
    return false; // 没有找到要删除的对象
  }
  
  saveDatePersons(updatedPersons);
  return true;
};

// 保存所有约会对象到本地存储
const saveDatePersons = (persons: DatePerson[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persons));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
}; 