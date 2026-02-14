import React, { useState, useRef, useEffect } from 'react';
import { 
  FaTrash, 
  FaEdit, 
  FaSmile, 
  FaFlag, 
  FaThumbtack,
  FaCheck,
  FaCheckDouble,
  FaReply,
  FaCopy,
  FaShare
} from 'react-icons/fa';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { formatDistanceToNow } from 'date-fns';

const Message = ({ 
  message, 
  isOwnMessage, 
  showAvatar, 
  onDelete, 
  onEdit, 
  onReact,
  onReport,
  onPin,
  previousMessage,
  nextMessage 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  const messageRef = useRef(null);
  const editInputRef = useRef(null);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '👎'];

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message._id, editContent);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const handleReaction = (reaction) => {
    onReact(message._id, reaction);
    setShowReactions(false);
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport(message._id, reportReason);
      setShowReportModal(false);
      setReportReason('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    // Show toast notification
  };

  const getMessageStyle = () => {
    if (isOwnMessage) {
      return 'bg-primary-600 text-white rounded-l-lg rounded-br-lg';
    }
    return 'bg-gray-100 text-gray-800 rounded-r-lg rounded-bl-lg';
  };

  const getMessageStatus = () => {
    if (!isOwnMessage) return null;
    
    if (message.readBy?.length > 1) {
      return <FaCheckDouble className="text-blue-400" />;
    }
    if (message.readBy?.length > 0) {
      return <FaCheck className="text-blue-400" />;
    }
    return <FaCheck className="text-gray-400" />;
  };

  const shouldShowTail = () => {
    if (!nextMessage) return true;
    return nextMessage.sender?._id !== message.sender?._id;
  };

  const shouldShowHeader = () => {
    if (!previousMessage) return true;
    return previousMessage.sender?._id !== message.sender?._id;
  };

  return (
    <div
      ref={messageRef}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for other users' messages */}
      {!isOwnMessage && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <Avatar
            src={message.sender?.avatar}
            alt={message.sender?.username}
            size="sm"
          />
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[70%] ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
        {/* Sender Name (for group messages) */}
        {!isOwnMessage && shouldShowHeader() && (
          <p className="text-xs text-gray-500 mb-1 ml-1">
            {message.sender?.username}
          </p>
        )}

        {/* Message Bubble */}
        <div className="relative">
          {/* Message Actions */}
          {showActions && (
            <div className={`absolute ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex space-x-1 px-2`}>
              <Tooltip content="Reply">
                <button className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <FaReply size={12} />
                </button>
              </Tooltip>
              
              <Tooltip content="Add reaction">
                <button 
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaSmile size={12} />
                </button>
              </Tooltip>
              
              <Tooltip content="Copy">
                <button 
                  onClick={handleCopy}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaCopy size={12} />
                </button>
              </Tooltip>
              
              {isOwnMessage ? (
                <>
                  <Tooltip content="Edit">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaEdit size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <button 
                      onClick={() => onDelete(message._id)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaTrash size={12} />
                    </button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip content="Pin">
                    <button 
                      onClick={() => onPin(message._id)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaThumbtack size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Report">
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaFlag size={12} />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className={`absolute ${isOwnMessage ? 'left-0' : 'right-0'} bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 flex space-x-1`}>
              {reactions.map(reaction => (
                <button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className="w-8 h-8 hover:bg-gray-100 rounded-full text-lg"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}

          {/* Message Bubble */}
          {isEditing ? (
            <div className={`${getMessageStyle()} p-2`}>
              <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleEdit}
                className="w-full bg-transparent border-none outline-none resize-none text-inherit"
                rows={editContent.split('\n').length}
              />
            </div>
          ) : (
            <div
              className={`
                ${getMessageStyle()} 
                p-3 
                ${shouldShowTail() ? '' : 'rounded-b-none'}
                ${message.type === 'system' ? 'bg-gray-200 text-gray-600 italic' : ''}
                ${message.type === 'correction' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' : ''}
              `}
            >
              {/* Correction indicator */}
              {message.type === 'correction' && (
                <div className="text-xs font-semibold mb-1 text-yellow-600">
                  Language Correction
                </div>
              )}

              {/* Message content */}
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* Original text for corrections */}
              {message.correction && (
                <div className="mt-2 pt-2 border-t border-yellow-300 text-xs">
                  <span className="line-through text-yellow-600">
                    {message.correction.original}
                  </span>
                  <span className="ml-2 text-green-600">
                    → {message.correction.corrected}
                  </span>
                  {message.correction.explanation && (
                    <p className="mt-1 text-yellow-700">
                      {message.correction.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Reactions */}
              {message.reactions && Object.keys(message.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(message.reactions).map(([reaction, users]) => (
                    <Tooltip key={reaction} content={`${users.length} ${users.length === 1 ? 'person' : 'people'}`}>
                      <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs cursor-pointer hover:bg-gray-300">
                        {reaction} {users.length}
                      </span>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Footer */}
        <div className={`flex items-center space-x-2 mt-1 text-xs ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-gray-400">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          
          {/* Message status */}
          {getMessageStatus()}
          
          {/* Edited indicator */}
          {message.edited && (
            <span className="text-gray-400">(edited)</span>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Report Message</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide a reason for reporting this message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows="4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;