import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaCheck, FaCheckDouble, FaReply, FaSmile, FaFlag, FaTrash } from 'react-icons/fa';
import Avatar from '../../ui/Avatar';
import Tooltip from '../../ui/Tooltip';

const ChatMessage = ({ message, isOwn }) => {
  const [showActions, setShowActions] = useState(false);

  const getMessageStatus = () => {
    if (!isOwn) return null;
    
    if (message.readBy?.length > 1) {
      return <FaCheckDouble className="text-blue-400" size={12} />;
    }
    if (message.readBy?.length > 0) {
      return <FaCheck className="text-blue-400" size={12} />;
    }
    return <FaCheck className="text-gray-400" size={12} />;
  };

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <Avatar
            src={message.user?.avatar}
            alt={message.user?.username}
            size="sm"
            className="mr-2 flex-shrink-0"
          />
        )}

        {/* Message Content */}
        <div className="relative">
          {/* Sender Name */}
          {!isOwn && (
            <p className="text-xs text-gray-400 mb-1 ml-1">
              {message.user?.username}
            </p>
          )}

          {/* Message Bubble */}
          <div
            className={`
              rounded-lg px-3 py-2 relative
              ${isOwn 
                ? 'bg-primary-600 text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-200 rounded-tl-none'
              }
            `}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Message Actions (on hover) */}
            {showActions && (
              <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} -translate-y-full mb-1 flex space-x-1`}>
                <Tooltip content="Reply">
                  <button className="p-1 bg-gray-800 rounded hover:bg-gray-700 transition">
                    <FaReply size={12} className="text-gray-400" />
                  </button>
                </Tooltip>
                <Tooltip content="React">
                  <button className="p-1 bg-gray-800 rounded hover:bg-gray-700 transition">
                    <FaSmile size={12} className="text-gray-400" />
                  </button>
                </Tooltip>
                {!isOwn && (
                  <Tooltip content="Report">
                    <button className="p-1 bg-gray-800 rounded hover:bg-gray-700 transition">
                      <FaFlag size={12} className="text-gray-400" />
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {/* Message Footer */}
          <div className={`flex items-center space-x-1 mt-1 text-xs ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
            {getMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;