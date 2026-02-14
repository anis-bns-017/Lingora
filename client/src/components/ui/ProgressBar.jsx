import React from 'react';

const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  labelPosition = 'right',
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const labelPositions = {
    top: 'flex-col',
    bottom: 'flex-col-reverse',
    left: 'flex-row items-center',
    right: 'flex-row-reverse items-center'
  };

  return (
    <div className={`flex ${labelPositions[labelPosition]} gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 min-w-[45px]">
          {Math.round(percentage)}%
        </span>
      )}
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${colors[color]} rounded-full transition-all duration-300 ${sizes[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;