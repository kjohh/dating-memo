import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePersonForm as DatePersonFormType, datePersonFormSchema, PRESET_POSITIVE_TAGS, PRESET_NEGATIVE_TAGS, PRESET_PERSONALITY_TAGS } from '@/types';
import TagSelector from './TagSelector';
import StarRating from './StarRating';
import { FaTimes, FaHeart, FaArrowRight, FaArrowLeft, FaUser, FaMapMarkerAlt, FaTags, FaStar, FaCheck } from 'react-icons/fa';

interface DatePersonFormProps {
  initialData?: Partial<DatePersonFormType>;
  onSubmit: (data: DatePersonFormType) => void;
  onCancel: () => void;
}

// 表单步骤
type FormStep = '基本信息' | '相遇信息' | '特质标签' | '评分和备注' | '确认';

const DatePersonForm: React.FC<DatePersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // 当前步骤
  const [currentStep, setCurrentStep] = useState<FormStep>('基本信息');
  
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
  const age = watch('age');
  const gender = watch('gender');
  const occupation = watch('occupation');
  const meetDate = watch('meetDate');
  const meetLocation = watch('meetLocation');
  const notes = watch('notes');

  // 步骤指示器
  const steps: FormStep[] = ['基本信息', '相遇信息', '特质标签', '评分和备注', '确认'];
  
  // 下一步
  const handleNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };
  
  // 上一步
  const handlePrevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // 检查当前步骤是否有效
  const isCurrentStepValid = () => {
    if (currentStep === '基本信息') {
      return !!name; // 至少需要填写名字
    }
    return true;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '未设置';
    try {
      return new Date(dateString).toLocaleDateString('zh-CN');
    } catch (e) {
      return dateString;
    }
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

      {/* 步骤指示器 */}
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`flex flex-col items-center ${index <= steps.indexOf(currentStep) ? 'text-primary' : 'text-gray-400'}`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                index < steps.indexOf(currentStep) 
                  ? 'bg-primary text-white' 
                  : index === steps.indexOf(currentStep)
                    ? 'border-2 border-primary text-primary'
                    : 'border border-gray-300 text-gray-400'
              }`}
            >
              {index < steps.indexOf(currentStep) ? (
                <FaCheck size={12} />
              ) : (
                index + 1
              )}
            </div>
            <span className="text-xs hidden sm:block">{step}</span>
          </div>
        ))}
      </div>

      {/* 基本信息步骤 */}
      {currentStep === '基本信息' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center mb-4">
            <FaUser className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">基本信息</h3>
          </div>
          
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

      {/* 相遇信息步骤 */}
      {currentStep === '相遇信息' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">相遇信息</h3>
          </div>
          
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

      {/* 特质标签步骤 */}
      {currentStep === '特质标签' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center mb-4">
            <FaTags className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">特质标签</h3>
          </div>
          
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

      {/* 评分和备注步骤 */}
      {currentStep === '评分和备注' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center mb-4">
            <FaStar className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">评分和备注</h3>
          </div>
          
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

      {/* 确认步骤 */}
      {currentStep === '确认' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <FaCheck className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">确认信息</h3>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">基本信息</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-gray-500">姓名：</span>
                <span className="font-medium">{name}</span>
              </div>
              {age && (
                <div>
                  <span className="text-gray-500">年龄：</span>
                  <span>{age} 岁</span>
                </div>
              )}
              {gender && (
                <div>
                  <span className="text-gray-500">性别：</span>
                  <span>{gender}</span>
                </div>
              )}
              {occupation && (
                <div>
                  <span className="text-gray-500">职业：</span>
                  <span>{occupation}</span>
                </div>
              )}
            </div>
          </div>
          
          {(meetDate || meetLocation) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">相遇信息</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {meetDate && (
                  <div>
                    <span className="text-gray-500">日期：</span>
                    <span>{formatDate(meetDate)}</span>
                  </div>
                )}
                {meetLocation && (
                  <div>
                    <span className="text-gray-500">地点：</span>
                    <span>{meetLocation}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {(positiveTags.length > 0 || negativeTags.length > 0 || personalityTags.length > 0 || customTags.length > 0) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">特质标签</h4>
              
              {positiveTags.length > 0 && (
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">优点：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {positiveTags.map(tag => (
                      <span key={tag} className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {negativeTags.length > 0 && (
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">缺点：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {negativeTags.map(tag => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {personalityTags.length > 0 && (
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">性格：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {personalityTags.map(tag => (
                      <span key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {customTags.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">自定义：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {customTags.map(tag => (
                      <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {(rating || notes) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">评分和备注</h4>
              
              {rating && (
                <div className="mb-2">
                  <span className="text-gray-500 text-sm">评分：</span>
                  <div className="mt-1">
                    <StarRating rating={Number(rating)} readonly size={16} />
                  </div>
                </div>
              )}
              
              {notes && (
                <div>
                  <span className="text-gray-500 text-sm">备注：</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 导航按钮 */}
      <div className="flex justify-between pt-4">
        <div>
          {currentStep !== '基本信息' && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FaArrowLeft />
              <span>上一步</span>
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          
          {currentStep !== '确认' ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isCurrentStepValid()}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>下一步</span>
              <FaArrowRight />
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors flex items-center gap-2"
            >
              <FaHeart className="heart-beat" />
              <span>{initialData?.name ? '保存修改' : '添加约会对象'}</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default DatePersonForm; 