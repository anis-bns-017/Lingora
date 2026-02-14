import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const Alert = ({
  type = 'info',
  message,
  description,
  onClose,
  className = ''
}) => {
  const types = {
    info: {
      icon: <FaInfoCircle className="text-blue-500" size={20} />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    success: {
      icon: <FaCheckCircle className="text-green-500" size={20} />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500" size={20} />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    error: {
      icon: <FaTimesCircle className="text-red-500" size={20} />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    }
  };

  const currentType = types[type];

  return (
    <div
      className={`
        ${currentType.bgColor}
        ${currentType.borderColor}
        border rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {currentType.icon}
        </div>
        <div className="ml-3 flex-1">
          {message && (
            <h3 className={`text-sm font-medium ${currentType.textColor}`}>
              {message}
            </h3>
          )}
          {description && (
            <div className={`mt-2 text-sm ${currentType.textColor}`}>
              {description}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-auto ${currentType.textColor} hover:opacity-75`}
          >
            <FaTimesCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;