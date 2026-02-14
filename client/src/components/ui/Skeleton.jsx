import React from 'react';

const Skeleton = ({ type = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const types = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rectangle: 'w-full',
    avatar: 'rounded-full w-10 h-10',
    button: 'h-10 w-24 rounded-md',
    card: 'h-48 w-full rounded-lg'
  };

  return (
    <div className={`${baseClasses} ${types[type]} ${className}`} />
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} type="text" className={i === lines - 1 ? 'w-3/4' : ''} />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton type="avatar" />
        <div className="flex-1">
          <Skeleton type="text" className="w-1/2" />
          <Skeleton type="text" className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export default Skeleton;