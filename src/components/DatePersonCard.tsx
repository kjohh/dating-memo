import React from 'react';
import { DatePerson } from '@/types';
import { FaUser, FaHeart, FaHeartBroken, FaUserTag, FaBriefcase, FaLink } from 'react-icons/fa';
import StarRating from './StarRating';

interface DatePersonCardProps {
  person: DatePerson;
  onClick: () => void;
}

const DatePersonCard: React.FC<DatePersonCardProps> = ({ person, onClick }) => {
  // 獲取認識管道
  const getMeetChannel = () => {
    if (!person.meetChannel) return null;
    
    const parts = person.meetChannel.split(':');
    return parts[0] === '其他' && parts.length > 1 
      ? `${parts[0]}: ${parts[1]}`
      : parts[0];
  };

  // 獲取隨機漸變背景
  const getRandomGradient = () => {
    const gradients = [
      'bg-gradient-to-r from-pink-400 to-purple-500',
      'bg-gradient-to-r from-purple-400 to-indigo-500',
      'bg-gradient-to-r from-indigo-400 to-cyan-500',
      'bg-gradient-to-r from-cyan-400 to-emerald-500',
      'bg-gradient-to-r from-emerald-400 to-yellow-500',
      'bg-gradient-to-r from-yellow-400 to-orange-500',
      'bg-gradient-to-r from-orange-400 to-pink-500',
    ];
    
    // 使用姓名的字符碼總和作為種子，確保同一個人總是得到相同的漸變
    const seed = person.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return gradients[seed % gradients.length];
  };

  const meetChannel = getMeetChannel();

  return (
    <div 
      className="card hover:cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-t-lg h-24">
        <div className={`absolute inset-0 ${getRandomGradient()} opacity-80`}></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold truncate">{person.name}</h3>
            {person.rating && <StarRating rating={person.rating} readonly size={16} />}
          </div>
          <div className="flex items-center text-sm opacity-90">
            {person.age && <span className="mr-2">{person.age}歲</span>}
            {person.gender && <span>{person.gender}</span>}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* 職業和認識管道 */}
        <div className="flex flex-wrap text-sm mb-3">
          {person.occupation && (
            <div className="flex items-center mr-4 mb-1">
              <FaBriefcase className="text-primary mr-1" />
              <span className="truncate">{person.occupation}</span>
            </div>
          )}
          
          {meetChannel && (
            <div className="flex items-center mb-1">
              <FaLink className="text-secondary mr-1" />
              <span className="truncate">{meetChannel}</span>
            </div>
          )}
        </div>
        
        {/* 社群帳號 */}
        {person.contactInfo && (
          <div className="flex items-center text-sm mb-3">
            <FaUser className="text-gray-500 mr-1" />
            <span className="truncate">{person.contactInfo}</span>
          </div>
        )}
        
        {/* 標籤 */}
        <div className="space-y-2">
          {/* 優點標籤 */}
          {person.positiveTags.length > 0 && (
            <div className="flex items-start">
              <FaHeart className="text-error mt-1 mr-2 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {person.positiveTags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                {person.positiveTags.length > 3 && (
                  <span className="text-xs text-gray-500">+{person.positiveTags.length - 3}</span>
                )}
              </div>
            </div>
          )}
          
          {/* 缺點標籤 */}
          {person.negativeTags.length > 0 && (
            <div className="flex items-start">
              <FaHeartBroken className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {person.negativeTags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                {person.negativeTags.length > 3 && (
                  <span className="text-xs text-gray-500">+{person.negativeTags.length - 3}</span>
                )}
              </div>
            </div>
          )}
          
          {/* 性格標籤 */}
          {person.personalityTags.length > 0 && (
            <div className="flex items-start">
              <FaUserTag className="text-secondary mt-1 mr-2 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {person.personalityTags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                {person.personalityTags.length > 3 && (
                  <span className="text-xs text-gray-500">+{person.personalityTags.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePersonCard; 