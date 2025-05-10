import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DatePersonForm as DatePersonFormType, 
  datePersonFormSchema, 
  PRESET_POSITIVE_TAGS, 
  PRESET_NEGATIVE_TAGS, 
  PRESET_PERSONALITY_TAGS,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_STATUS_DESCRIPTIONS,
  RelationshipStatus,
  MEET_CHANNELS,
  MeetChannel
} from '@/types';
import TagSelector from './TagSelector';
import StarRating from './StarRating';
import { FaTimes, FaUser, FaTags, FaFileAlt, FaCheck, FaTrash, FaHeart, FaArrowLeft } from 'react-icons/fa';

interface DatePersonFormProps {
  initialData?: Partial<DatePersonFormType>;
  onSubmit: (data: DatePersonFormType) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// 表單標籤頁
type FormTab = '基本' | '特質' | '備註';

// 認識管道選項
type MeetChannel = '交友軟體' | '社群媒體' | '親友介紹' | '工作關係' | '其他';

const DatePersonForm: React.FC<DatePersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete
}) => {
  // 當前標籤頁
  const [currentTab, setCurrentTab] = useState<FormTab>('基本');
  const [meetChannel, setMeetChannel] = useState<MeetChannel | undefined>(undefined);
  const [otherChannel, setOtherChannel] = useState<string>('');
  const [isTabSticky, setIsTabSticky] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DatePersonFormType>({
    resolver: zodResolver(datePersonFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age ? String(initialData.age) : '' as any,
      gender: initialData?.gender || undefined,
      occupation: initialData?.occupation || '',
      contactInfo: initialData?.contactInfo || '',
      notes: initialData?.notes || '',
      positiveTags: initialData?.positiveTags || [],
      negativeTags: initialData?.negativeTags || [],
      personalityTags: initialData?.personalityTags || [],
      rating: initialData?.rating ? String(initialData.rating) : '' as any,
      meetChannel: initialData?.meetChannel || '',
      instagramAccount: initialData?.instagramAccount || '',
      relationshipStatus: initialData?.relationshipStatus || '觀察中',
      firstDateAt: initialData?.firstDateAt || '',
    },
    mode: 'onChange'
  });

  // 從 localStorage 獲取上次使用的性別
  useEffect(() => {
    const savedGender = localStorage.getItem('lastUsedGender');
    if (savedGender && !initialData?.gender) {
      setValue('gender', savedGender as "男" | "女" | "其他");
    }
    
    // 設置認識管道
    if (initialData?.meetChannel) {
      const channelParts = initialData.meetChannel.split(':');
      if (channelParts.length > 0) {
        const channel = channelParts[0] as MeetChannel;
        setMeetChannel(channel);
        if (channel === '其他' && channelParts.length > 1) {
          setOtherChannel(channelParts[1]);
        }
      }
    }
  }, [initialData, setValue]);
  
  // 處理滾動時標籤頁固定在頂部
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current && headerRef.current) {
        const tabsPosition = tabsRef.current.getBoundingClientRect().top;
        if (tabsPosition <= 0 && !isTabSticky) {
          setIsTabSticky(true);
        } else if (tabsPosition > 0 && isTabSticky) {
          setIsTabSticky(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTabSticky]);
  
  // 切換標籤頁時滾動到頂部
  const handleTabChange = (tab: FormTab) => {
    setCurrentTab(tab);
    if (formRef.current && isTabSticky) {
      const tabsOffset = isTabSticky ? 50 : 0; // 大約標籤頁的高度
      window.scrollTo({
        top: formRef.current.offsetTop + tabsOffset,
        behavior: 'smooth'
      });
    }
  };

  const positiveTags = watch('positiveTags');
  const negativeTags = watch('negativeTags');
  const personalityTags = watch('personalityTags');
  const gender = watch('gender');
  const rating = watch('rating');
  const name = watch('name');

  // 標籤頁列表
  const tabs: FormTab[] = ['基本', '特質', '備註'];
  
  // 獲取標籤頁圖標
  const getTabIcon = (tab: FormTab) => {
    switch (tab) {
      case '基本': return <FaUser />;
      case '特質': return <FaTags />;
      case '備註': return <FaFileAlt />;
      default: return null;
    }
  };

  // 檢查表單是否有效
  const isFormValid = () => {
    return !!name; // 至少需要填寫姓名
  };
  
  // 處理認識管道變更
  const handleMeetChannelChange = (channel: MeetChannel) => {
    setMeetChannel(channel);
    const value = channel === '其他' && otherChannel 
      ? `${channel}:${otherChannel}` 
      : channel;
    setValue('meetChannel', value);
  };
  
  // 處理其他管道輸入
  const handleOtherChannelChange = (value: string) => {
    setOtherChannel(value);
    setValue('meetChannel', `其他:${value}`);
  };
  
  // 處理表單提交
  const onFormSubmit = (data: DatePersonFormType) => {
    // 保存最後使用的性別
    if (data.gender) {
      localStorage.setItem('lastUsedGender', data.gender);
    }
    
    onSubmit(data);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full md:h-auto">
      {/* 頂部導航列 */}
      <div ref={headerRef} className="sticky top-0 z-10 bg-gray-900 p-4 border-b border-gray-800 flex items-center">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white mr-3"
          aria-label="返回"
        >
          <FaArrowLeft size={18} />
        </button>
        
        <h2 className="text-xl font-bold gradient-text flex-1">
          {initialData?.name ? `${initialData.name}` : '新增約會對象'}
        </h2>
        
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-error hover:text-red-600"
            aria-label="刪除"
          >
            <FaTrash size={18} />
          </button>
        )}
      </div>

      {/* 標籤頁導航 */}
      <div 
        ref={tabsRef}
        className={`flex bg-gray-900 border-b border-gray-800 ${isTabSticky ? 'sticky top-12 z-10' : ''}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors flex-1 ${
              currentTab === tab 
                ? 'text-primary border-b-2 border-primary -mb-px' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {getTabIcon(tab)}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* 標籤頁內容 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* 基本資訊 */}
        {currentTab === '基本' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                姓名 <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入姓名"
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">
                年齡
              </label>
              <input
                id="age"
                type="number"
                min="18"
                {...register('age')}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入年齡"
              />
              {errors.age && (
                <p className="text-error text-sm mt-1">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                關係狀態
              </label>
              <select
                value={watch('relationshipStatus')}
                onChange={(e) => setValue('relationshipStatus', e.target.value as RelationshipStatus)}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary text-gray-200"
              >
                {RELATIONSHIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-text mt-2">
                {RELATIONSHIP_STATUS_DESCRIPTIONS[watch('relationshipStatus') as RelationshipStatus]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                生理性別
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue('gender', '男')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === '男'
                      ? 'btn-primary border-0'
                      : 'bg-gray-800/70 border-gray-700'
                  }`}
                >
                  男
                </button>
                <button
                  type="button"
                  onClick={() => setValue('gender', '女')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === '女'
                      ? 'btn-primary border-0'
                      : 'bg-gray-800/70 border-gray-700'
                  }`}
                >
                  女
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                評分
              </label>
              <StarRating
                rating={(rating ? Number(rating) : 0) as any}
                onChange={(value: any) => setValue('rating', value.toString())}
              />
            </div>
          </div>
        )}

        {/* 特質標籤 */}
        {currentTab === '特質' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">優點</h3>
              <TagSelector
                availableTags={PRESET_POSITIVE_TAGS}
                selectedTags={positiveTags}
                onChange={(tags) => setValue('positiveTags', tags)}
                tagClassName="bg-green-100 text-green-800"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">缺點</h3>
              <TagSelector
                availableTags={PRESET_NEGATIVE_TAGS}
                selectedTags={negativeTags}
                onChange={(tags) => setValue('negativeTags', tags)}
                tagClassName="bg-red-100 text-red-800"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">性格特質</h3>
              <TagSelector
                availableTags={PRESET_PERSONALITY_TAGS}
                selectedTags={personalityTags}
                onChange={(tags) => setValue('personalityTags', tags)}
                tagClassName="bg-blue-100 text-blue-800"
              />
            </div>
          </div>
        )}

        {/* 備註 */}
        {currentTab === '備註' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                認識管道
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {(['交友軟體', '社群媒體', '親友介紹', '工作關係', '其他'] as MeetChannel[]).map(channel => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => handleMeetChannelChange(channel)}
                    className={`py-2 px-3 rounded-lg border text-sm ${
                      meetChannel === channel
                        ? 'btn-primary border-0'
                        : 'bg-gray-800/70 border-gray-700'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
              
              {meetChannel === '其他' && (
                <input
                  type="text"
                  value={otherChannel}
                  onChange={(e) => handleOtherChannelChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  placeholder="請輸入其他認識管道"
                />
              )}
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium mb-1">
                職業
              </label>
              <input
                id="occupation"
                type="text"
                {...register('occupation')}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入職業"
              />
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium mb-1">
                社群帳號
              </label>
              <input
                id="contactInfo"
                type="text"
                {...register('contactInfo')}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="IG、FB、Line ID 等"
              />
            </div>

            <div>
              <label htmlFor="instagramAccount" className="block text-sm font-medium mb-1">
                Instagram 帳號
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                  instagram.com/
                </span>
                <input
                  id="instagramAccount"
                  type="text"
                  {...register('instagramAccount')}
                  className="flex-1 px-4 py-2 rounded-r-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-text mt-1">請輸入不含 @ 的用戶名，例如：username</p>
            </div>

            <div>
              <label htmlFor="firstDateAt" className="block text-sm font-medium mb-1">
                初次約會
              </label>
              <input
                id="firstDateAt"
                type="text"
                {...register('firstDateAt')}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="記錄初次約會的時間、地點或其他相關資訊..."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                備註
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="記錄你的印象、感受或其他重要資訊..."
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {/* 底部按鈕區域 */}
      <div className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-800 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`btn-primary ${
            !isFormValid() && 'opacity-50 cursor-not-allowed'
          }`}
        >
          <FaCheck />
          <span>儲存</span>
        </button>
      </div>
    </form>
  );
};

export default DatePersonForm; 