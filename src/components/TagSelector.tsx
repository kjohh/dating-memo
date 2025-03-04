import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TagSelectorProps {
  title?: string;
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  tagClassName?: string;
  maxTags?: number;
  allowCustomTags?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  title,
  availableTags,
  selectedTags,
  onChange,
  tagClassName = 'bg-primary text-white',
  maxTags = 10,
  allowCustomTags = true,
}) => {
  const [customTag, setCustomTag] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length >= maxTags) return;
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim() || selectedTags.includes(customTag.trim())) {
      setCustomTag('');
      return;
    }
    
    if (selectedTags.length >= maxTags) return;
    
    onChange([...selectedTags, customTag.trim()]);
    setCustomTag('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // 顯示的預設標籤
  const displayedPresetTags = showAllTags ? availableTags : availableTags.slice(0, 8);

  return (
    <div className="mb-4">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      
      {/* 已選標籤 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.length === 0 ? (
          <p className="text-gray-500 text-sm italic">還沒有選擇標籤</p>
        ) : (
          selectedTags.map(tag => (
            <div 
              key={tag} 
              className={`${tagClassName} px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-fadeIn`}
            >
              <span>{tag}</span>
              <button 
                type="button"
                onClick={() => handleTagClick(tag)}
                className="hover:bg-white/20 rounded-full p-1"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* 預設標籤 */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {displayedPresetTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-all ${
                selectedTags.includes(tag)
                  ? `${tagClassName} border-transparent`
                  : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
              }`}
            >
              {tag}
            </button>
          ))}
          
          {availableTags.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllTags(!showAllTags)}
              className="px-3 py-1 rounded-full text-sm border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary dark:hover:border-primary"
            >
              {showAllTags ? '收起' : '更多...'}
            </button>
          )}
        </div>
      )}
      
      {/* 自定義標籤輸入 */}
      {allowCustomTags && (
        <div className="flex items-center">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新增自定義標籤..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={15}
          />
        </div>
      )}
      
      {selectedTags.length >= maxTags && (
        <p className="text-error text-xs mt-1">最多只能新增 {maxTags} 個標籤</p>
      )}
    </div>
  );
};

export default TagSelector; 