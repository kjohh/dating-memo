import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  size = 24,
  readonly = false,
}) => {
  const handleClick = (selectedRating: number) => {
    if (readonly || !onChange) return;
    onChange(selectedRating);
  };

  const renderStar = (position: number) => {
    const isHalf = rating - position + 0.5 >= 0 && rating - position < 0;
    const isFilled = rating - position >= 0;

    if (isHalf) {
      return <FaStarHalfAlt size={size} className="text-accent" />;
    } else if (isFilled) {
      return <FaStar size={size} className="text-accent" />;
    } else {
      return <FaRegStar size={size} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((position) => (
        <button
          key={position}
          type="button"
          onClick={() => handleClick(position)}
          className={`p-1 transition-transform ${!readonly && 'hover:scale-110'} ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readonly}
          aria-label={`${position} 星`}
        >
          {renderStar(position)}
        </button>
      ))}
    </div>
  );
};

export default StarRating; 