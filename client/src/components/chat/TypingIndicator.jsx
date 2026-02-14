import React from 'react';
import Avatar from '../ui/Avatar';

const TypingIndicator = ({ users }) => {
  const getTypingText = () => {
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0].username} is typing...`;
    if (users.length === 2) return `${users[0].username} and ${users[1].username} are typing...`;
    return `${users[0].username} and ${users.length - 1} others are typing...`;
  };

  if (users.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 py-2">
      {/* Avatars for multiple users */}
      {users.length > 1 && (
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, index) => (
            <Avatar
              key={user.userId}
              src={user.avatar}
              alt={user.username}
              size="xs"
              className="border-2 border-white"
            />
          ))}
        </div>
      )}

      {/* Typing animation */}
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-500">{getTypingText()}</span>
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;