import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Dropdown = ({
  trigger,
  children,
  position = 'bottom-left',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positions = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2'
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
            <span>Menu</span>
            <FaChevronDown size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-[200px]
            bg-white rounded-md shadow-lg
            border border-gray-200 py-1
            ${positions[position]}
            ${className}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-2
        hover:bg-gray-100
        transition duration-150
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Dropdown;