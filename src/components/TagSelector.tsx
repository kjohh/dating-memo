import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface TagSelectorProps {
  title: string;
  presetTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  tagColorClass?: string;
  maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  title,
  presetTags,
  selectedTags,
  onChange,
  tagColorClass = 'bg-primary',
  maxTags = 10,
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

  // 显示的预设标签
  const displayedPresetTags = showAllTags ? presetTags : presetTags.slice(0, 8);

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {/* 已选标签 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.length === 0 ? (
          <p className="text-gray-500 text-sm italic">还没有选择标签</p>
        ) : (
          selectedTags.map(tag => (
            <div 
              key={tag} 
              className={`${tagColorClass} text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-fadeIn`}
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
      
      {/* 预设标签 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {displayedPresetTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full text-sm border transition-all ${
              selectedTags.includes(tag)
                ? `${tagColorClass} text-white border-transparent`
                : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
            }`}
          >
            {tag}
          </button>
        ))}
        
        {presetTags.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllTags(!showAllTags)}
            className="px-3 py-1 rounded-full text-sm border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary dark:hover:border-primary"
          >
            {showAllTags ? '收起' : '更多...'}
          </button>
        )}
      </div>
      
      {/* 自定义标签输入 */}
      <div className="flex items-center">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加自定义标签..."
          className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={15}
        />
        <button
          type="button"
          onClick={handleAddCustomTag}
          disabled={!customTag.trim()}
          className="px-3 py-2 rounded-r-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus />
        </button>
      </div>
      
      {selectedTags.length >= maxTags && (
        <p className="text-error text-xs mt-1">最多只能添加 {maxTags} 个标签</p>
      )}
    </div>
  );
};

export default TagSelector; 