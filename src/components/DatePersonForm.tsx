import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePersonForm as DatePersonFormType, datePersonFormSchema, PRESET_POSITIVE_TAGS, PRESET_NEGATIVE_TAGS, PRESET_PERSONALITY_TAGS } from '@/types';
import TagSelector from './TagSelector';
import StarRating from './StarRating';
import { FaTimes, FaUser, FaTags, FaFileAlt, FaCheck } from 'react-icons/fa';

interface DatePersonFormProps {
  initialData?: Partial<DatePersonFormType>;
  onSubmit: (data: DatePersonFormType) => void;
  onCancel: () => void;
}

// 表單標籤頁
type FormTab = '基本' | '特質' | '備註';

// 認識管道選項
type MeetChannel = '交友軟體' | '社群媒體' | '親友介紹' | '工作關係' | '其他';

const DatePersonForm: React.FC<DatePersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // 當前標籤頁
  const [currentTab, setCurrentTab] = useState<FormTab>('基本');
  const [meetChannel, setMeetChannel] = useState<MeetChannel | undefined>(undefined);
  const [otherChannel, setOtherChannel] = useState<string>('');
  
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-0 top-0 p-2 text-gray-500 hover:text-error"
          aria-label="關閉"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 gradient-text">
          {initialData?.name ? `編輯 ${initialData.name} 的資料` : '新增約會對象'}
        </h2>
      </div>

      {/* 標籤頁導航 */}
      <div className="flex flex-wrap border-b border-gray-300 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCurrentTab(tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              currentTab === tab 
                ? 'text-primary border-b-2 border-primary -mb-px' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            style={{ width: `${100 / tabs.length}%` }}
          >
            {getTabIcon(tab)}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* 標籤頁內容 */}
      <div className="space-y-6">
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入姓名"
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name.message}</p>
              )}
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
                      : 'bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700'
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
                      : 'bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  女
                </button>
              </div>
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入年齡"
              />
              {errors.age && (
                <p className="text-error text-sm mt-1">{errors.age.message}</p>
              )}
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
                tagClassName="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">缺點</h3>
              <TagSelector
                availableTags={PRESET_NEGATIVE_TAGS}
                selectedTags={negativeTags}
                onChange={(tags) => setValue('negativeTags', tags)}
                tagClassName="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">性格特質</h3>
              <TagSelector
                availableTags={PRESET_PERSONALITY_TAGS}
                selectedTags={personalityTags}
                onChange={(tags) => setValue('personalityTags', tags)}
                tagClassName="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
                        : 'bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-700'
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="IG、FB、Line ID 等"
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="記錄你的印象、感受或其他重要資訊..."
              ></textarea>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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