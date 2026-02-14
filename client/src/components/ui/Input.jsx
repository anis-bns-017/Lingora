import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-3 py-2 
          ${icon ? 'pl-10' : ''}
          border ${error ? 'border-red-500' : 'border-gray-300'} 
          rounded-md 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition duration-200
          ${className}
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;