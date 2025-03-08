import React from 'react';
import { DatePerson, RELATIONSHIP_STATUS_COLORS } from '@/types';
import { FaStar, FaInstagram, FaHeart, FaEye, FaCalendarCheck, FaSmile, FaHandHoldingHeart, FaRing, FaTimesCircle } from 'react-icons/fa';

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

  // 處理 Instagram 點擊
  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發卡片的點擊事件
    if (person.instagramAccount) {
      window.open(`https://instagram.com/${person.instagramAccount}`, '_blank');
    }
  };

  // 獲取隨機背景色
  const getRandomColor = () => {
    const colors = [
      'bg-accent',
      'bg-secondary',
      'bg-emerald-200',
      'bg-sky-200',
      'bg-indigo-200',
      'bg-rose-200',
    ];
    
    // 使用姓名的字符碼總和作為種子，確保同一個人總是得到相同的顏色
    const seed = person.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[seed % colors.length];
  };

  // 獲取幽默的標題前綴
  const getHumorousPrefix = () => {
    const prefixes = ['戀愛候選人', '心動對象', '緣分之人', '靈魂伴侶', '約會高手', '愛情冒險家'];
    const seed = person.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return prefixes[seed % prefixes.length];
  };

  // 獲取關係狀態圖標
  const getRelationshipIcon = () => {
    switch (person.relationshipStatus) {
      case '觀察中':
        return <FaEye className="mr-1" />;
      case '約見面':
        return <FaCalendarCheck className="mr-1" />;
      case '曖昧中':
        return <FaSmile className="mr-1" />;
      case '穩定發展':
        return <FaHandHoldingHeart className="mr-1" />;
      case '正式交往':
        return <FaRing className="mr-1" />;
      case '結束 / 無發展':
        return <FaTimesCircle className="mr-1" />;
      default:
        return null;
    }
  };

  const meetChannel = getMeetChannel();
  const prefix = getHumorousPrefix();
  const randomColor = getRandomColor();

  return (
    <div 
      className="card hover:cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-6 flex flex-col h-full">
        {/* 頂部區域 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold">{person.name}</h3>
            <div className="flex items-center gap-2">
              {person.rating && (
                <div className="flex items-center">
                  <FaStar className="text-accent mr-1" size={16} />
                  <span className="gradient-text font-medium">{person.rating}.0</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-text">{prefix}</p>
        </div>
        
        {/* 主要資訊區 */}
        <div className="flex-grow">
          {/* 基本資訊 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {person.relationshipStatus && (
              <div className={`text-sm px-3 py-1 rounded-full ${RELATIONSHIP_STATUS_COLORS[person.relationshipStatus].bg} ${RELATIONSHIP_STATUS_COLORS[person.relationshipStatus].text} font-medium flex items-center`}>
                {getRelationshipIcon()}
                {person.relationshipStatus}
              </div>
            )}
            {person.age && (
              <div className="text-sm px-3 py-1 rounded-full bg-tag-bg text-tag-text">
                {person.age}歲
              </div>
            )}
            {person.gender && (
              <div className="text-sm px-3 py-1 rounded-full bg-tag-bg text-tag-text">
                {person.gender}
              </div>
            )}
            {person.occupation && (
              <div className="text-sm px-3 py-1 rounded-full bg-tag-bg text-tag-text">
                {person.occupation}
              </div>
            )}
          </div>
          
          {/* 標籤區域 */}
          <div className="space-y-3">
            {/* 優點標籤 */}
            {person.positiveTags.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-secondary mr-2"></div>
                  <span className="text-sm font-medium">優點</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {person.positiveTags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-tag-bg text-tag-text">
                      {tag}
                    </span>
                  ))}
                  {person.positiveTags.length > 3 && (
                    <span className="text-xs text-muted-text">+{person.positiveTags.length - 3}</span>
                  )}
                </div>
              </div>
            )}
            
            {/* 缺點標籤 */}
            {person.negativeTags.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-muted-text mr-2"></div>
                  <span className="text-sm font-medium">缺點</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {person.negativeTags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-tag-bg text-tag-text">
                      {tag}
                    </span>
                  ))}
                  {person.negativeTags.length > 3 && (
                    <span className="text-xs text-muted-text">+{person.negativeTags.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 底部區域 */}
        <div className="mt-4 pt-4 border-t border-card-border flex justify-between items-center">
          {meetChannel && (
            <div className="text-xs text-muted-text">
              {meetChannel}
            </div>
          )}
          
          {person.instagramAccount && (
            <button 
              onClick={handleInstagramClick}
              className="text-pink-500 hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePersonCard; 