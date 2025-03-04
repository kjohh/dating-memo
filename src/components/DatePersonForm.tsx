import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePersonForm as DatePersonFormType, datePersonFormSchema, PRESET_POSITIVE_TAGS, PRESET_NEGATIVE_TAGS, PRESET_PERSONALITY_TAGS } from '@/types';
import TagSelector from './TagSelector';
import StarRating from './StarRating';
import { FaTimes, FaHeart, FaUser, FaMapMarkerAlt, FaTags, FaStar, FaCheck } from 'react-icons/fa';

interface DatePersonFormProps {
  initialData?: Partial<DatePersonFormType>;
  onSubmit: (data: DatePersonFormType) => void;
  onCancel: () => void;
}

// 表單標籤頁
type FormTab = '基本資訊' | '相遇資訊' | '特質標籤' | '評分和備註';

const DatePersonForm: React.FC<DatePersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // 當前標籤頁
  const [currentTab, setCurrentTab] = useState<FormTab>('基本資訊');
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<DatePersonFormType>({
    resolver: zodResolver(datePersonFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age ? initialData.age.toString() : '',
      gender: initialData?.gender || undefined,
      occupation: initialData?.occupation || '',
      contactInfo: initialData?.contactInfo || '',
      meetDate: initialData?.meetDate ? initialData.meetDate.toISOString().split('T')[0] : '',
      meetLocation: initialData?.meetLocation || '',
      notes: initialData?.notes || '',
      positiveTags: initialData?.positiveTags || [],
      negativeTags: initialData?.negativeTags || [],
      personalityTags: initialData?.personalityTags || [],
      customTags: initialData?.customTags || [],
      rating: initialData?.rating ? initialData.rating.toString() : '',
      imageUrl: initialData?.imageUrl || '',
    },
    mode: 'onChange'
  });

  const positiveTags = watch('positiveTags');
  const negativeTags = watch('negativeTags');
  const personalityTags = watch('personalityTags');
  const customTags = watch('customTags');
  const rating = watch('rating');
  const name = watch('name');

  // 標籤頁列表
  const tabs: FormTab[] = ['基本資訊', '相遇資訊', '特質標籤', '評分和備註'];
  
  // 獲取標籤頁圖標
  const getTabIcon = (tab: FormTab) => {
    switch (tab) {
      case '基本資訊': return <FaUser />;
      case '相遇資訊': return <FaMapMarkerAlt />;
      case '特質標籤': return <FaTags />;
      case '評分和備註': return <FaStar />;
      default: return null;
    }
  };

  // 檢查表單是否有效
  const isFormValid = () => {
    return !!name; // 至少需要填寫姓名
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {currentTab === '基本資訊' && (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                  性別
                </label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">請選擇</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              </div>
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
                聯絡方式
              </label>
              <input
                id="contactInfo"
                type="text"
                {...register('contactInfo')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="電話、Line ID、IG 等"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                照片連結
              </label>
              <input
                id="imageUrl"
                type="text"
                {...register('imageUrl')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入照片連結"
              />
            </div>
          </div>
        )}

        {/* 相遇資訊 */}
        {currentTab === '相遇資訊' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="meetDate" className="block text-sm font-medium mb-1">
                相遇日期
              </label>
              <input
                id="meetDate"
                type="date"
                {...register('meetDate')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="meetLocation" className="block text-sm font-medium mb-1">
                相遇地點
              </label>
              <input
                id="meetLocation"
                type="text"
                {...register('meetLocation')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="請輸入相遇地點"
              />
            </div>
          </div>
        )}

        {/* 特質標籤 */}
        {currentTab === '特質標籤' && (
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

            <div>
              <h3 className="text-lg font-medium mb-2">自定義標籤</h3>
              <TagSelector
                availableTags={[]}
                selectedTags={customTags}
                onChange={(tags) => setValue('customTags', tags)}
                allowCustomTags
                tagClassName="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              />
            </div>
          </div>
        )}

        {/* 評分和備註 */}
        {currentTab === '評分和備註' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                整體評分
              </label>
              <StarRating
                rating={rating ? parseInt(rating, 10) : 0}
                onChange={(value) => setValue('rating', value.toString())}
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
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isFormValid()
              ? 'bg-primary hover:bg-primary-dark text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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