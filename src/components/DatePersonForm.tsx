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

// 表单标签页
type FormTab = '基本信息' | '相遇信息' | '特质标签' | '评分和备注';

const DatePersonForm: React.FC<DatePersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // 当前标签页
  const [currentTab, setCurrentTab] = useState<FormTab>('基本信息');
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<DatePersonFormType>({
    resolver: zodResolver(datePersonFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age || '',
      gender: initialData?.gender || undefined,
      occupation: initialData?.occupation || '',
      contactInfo: initialData?.contactInfo || '',
      meetDate: initialData?.meetDate || '',
      meetLocation: initialData?.meetLocation || '',
      notes: initialData?.notes || '',
      positiveTags: initialData?.positiveTags || [],
      negativeTags: initialData?.negativeTags || [],
      personalityTags: initialData?.personalityTags || [],
      customTags: initialData?.customTags || [],
      rating: initialData?.rating || '',
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

  // 标签页列表
  const tabs: FormTab[] = ['基本信息', '相遇信息', '特质标签', '评分和备注'];
  
  // 获取标签页图标
  const getTabIcon = (tab: FormTab) => {
    switch (tab) {
      case '基本信息': return <FaUser />;
      case '相遇信息': return <FaMapMarkerAlt />;
      case '特质标签': return <FaTags />;
      case '评分和备注': return <FaStar />;
      default: return null;
    }
  };

  // 检查表单是否有效
  const isFormValid = () => {
    return !!name; // 至少需要填写名字
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-0 top-0 p-2 text-gray-500 hover:text-error"
          aria-label="关闭"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 gradient-text">
          {initialData?.name ? `编辑 ${initialData.name} 的资料` : '添加新的约会对象'}
        </h2>
      </div>

      {/* 标签页导航 */}
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
          >
            {getTabIcon(tab)}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* 基本信息标签页 */}
      {currentTab === '基本信息' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              姓名 <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入姓名..."
            />
            {errors.name && (
              <p className="text-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">
                年龄
              </label>
              <input
                id="age"
                type="number"
                min="18"
                {...register('age')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="输入年龄..."
              />
              {errors.age && (
                <p className="text-error text-xs mt-1">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">
                性别
              </label>
              <select
                id="gender"
                {...register('gender')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">选择性别...</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="occupation" className="block text-sm font-medium mb-1">
              职业
            </label>
            <input
              id="occupation"
              type="text"
              {...register('occupation')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入职业..."
            />
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium mb-1">
              联系方式
            </label>
            <input
              id="contactInfo"
              type="text"
              {...register('contactInfo')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入联系方式..."
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
              头像图片URL
            </label>
            <input
              id="imageUrl"
              type="text"
              {...register('imageUrl')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入图片URL..."
            />
          </div>
        </div>
      )}

      {/* 相遇信息标签页 */}
      {currentTab === '相遇信息' && (
        <div className="space-y-4 animate-fadeIn">
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
              相遇地点
            </label>
            <input
              id="meetLocation"
              type="text"
              {...register('meetLocation')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入地点..."
            />
          </div>
        </div>
      )}

      {/* 特质标签标签页 */}
      {currentTab === '特质标签' && (
        <div className="space-y-4 animate-fadeIn">
          <TagSelector
            title="优点标签"
            presetTags={PRESET_POSITIVE_TAGS}
            selectedTags={positiveTags}
            onChange={(tags) => setValue('positiveTags', tags)}
            tagColorClass="bg-pink-500"
          />
          
          <TagSelector
            title="缺点标签"
            presetTags={PRESET_NEGATIVE_TAGS}
            selectedTags={negativeTags}
            onChange={(tags) => setValue('negativeTags', tags)}
            tagColorClass="bg-gray-500"
          />
          
          <TagSelector
            title="性格标签"
            presetTags={PRESET_PERSONALITY_TAGS}
            selectedTags={personalityTags}
            onChange={(tags) => setValue('personalityTags', tags)}
            tagColorClass="bg-purple-500"
          />
          
          <TagSelector
            title="自定义标签"
            presetTags={[]}
            selectedTags={customTags}
            onChange={(tags) => setValue('customTags', tags)}
            tagColorClass="bg-blue-500"
          />
        </div>
      )}

      {/* 评分和备注标签页 */}
      {currentTab === '评分和备注' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-lg font-semibold mb-2">总体评分</h3>
            <StarRating
              rating={rating ? Number(rating) : 0}
              onChange={(value) => setValue('rating', String(value))}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-lg font-semibold mb-2">
              备注
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="添加一些备注..."
            ></textarea>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-300 dark:border-gray-700 mt-6">
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
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaHeart className="heart-beat" />
          <span>{initialData?.name ? '保存修改' : '添加约会对象'}</span>
        </button>
      </div>
    </form>
  );
};

export default DatePersonForm; 