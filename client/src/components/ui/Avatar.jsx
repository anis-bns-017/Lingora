import React from 'react';
import { FaUser } from 'react-icons/fa';

const Avatar = ({
  src,
  alt,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const handleError = (e) => {
    e.target.src = '/default-avatar.png';
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        overflow-hidden
        bg-gray-200
        flex items-center justify-center
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <FaUser className="text-gray-500" />
      )}
    </div>
  );
};

export default Avatar;