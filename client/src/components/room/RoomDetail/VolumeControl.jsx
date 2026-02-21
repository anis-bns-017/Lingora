import React, { useRef, useEffect } from 'react';

const VolumeControl = ({ volume, onVolumeChange, onClose }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={sliderRef}
      className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700"
    >
      <div className="flex flex-col items-center space-y-2">
        <span className="text-xs text-gray-400">Master Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
          }}
        />
        <div className="flex items-center justify-between w-full text-xs text-gray-400">
          <span>0%</span>
          <span className="text-white font-medium">{volume}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;