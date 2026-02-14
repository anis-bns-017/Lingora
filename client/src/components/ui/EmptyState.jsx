import React from 'react';
import { FaInbox } from 'react-icons/fa';
import Button from './Button';

const EmptyState = ({
  icon = <FaInbox className="text-gray-400 text-6xl" />,
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;