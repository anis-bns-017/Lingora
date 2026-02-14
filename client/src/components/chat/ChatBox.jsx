import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaSmile, FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import socketService from '../../services/socketService';
import { addToast } from '../../store/slices/uiSlice';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const ChatBox = ({ roomId, socket, onClose, isEmbedded = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleMessageDeleted = (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const handleMessageEdited = (updatedMessage) => {
      setMessages(prev => prev.map(m => 
        m._id === updatedMessage._id ? updatedMessage : m
      ));
    };

    const handleUserTyping = ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add({ userId, username });
        } else {
          newSet.forEach(user => {
            if (user.userId === userId) {
              newSet.delete(user);
            }
          });
        }
        return newSet;
      });
    };

    const handleMessagesRead = ({ messageIds, userId }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) 
          ? { ...msg, readBy: [...(msg.readBy || []), { user: userId, readAt: new Date() }] }
          : msg
      ));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('message-edited', handleMessageEdited);
    socket.on('user-typing', handleUserTyping);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('message-edited', handleMessageEdited);
      socket.off('user-typing', handleUserTyping);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Simulate API call - replace with actual API
      const response = await fetch(`/api/messages/room/${roomId}?page=${page}&limit=20`);
      const data = await response.json();
      
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('Failed to load messages');
      dispatch(addToast({
        type: 'error',
        message: 'Failed to load messages'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (content, type = 'text', correction = null) => {
    if (!content.trim() || !socket) return;

    const messageData = {
      roomId,
      content: content.trim(),
      type,
      correction
    };

    socket.emit('send-message', messageData);
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;

    socket.emit('typing', { roomId, isTyping });

    // Clear typing indicator after 2 seconds of no typing
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId, isTyping: false });
      }, 2000);
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (!socket) return;
    socket.emit('delete-message', { roomId, messageId });
  };

  const handleEditMessage = (messageId, newContent) => {
    if (!socket) return;
    socket.emit('edit-message', { roomId, messageId, content: newContent });
  };

  const handleReactToMessage = (messageId, reaction) => {
    if (!socket) return;
    socket.emit('react-to-message', { roomId, messageId, reaction });
  };

  const handleReportMessage = (messageId, reason) => {
    if (!socket) return;
    socket.emit('report-message', { roomId, messageId, reason });
    dispatch(addToast({
      type: 'success',
      message: 'Message reported to moderators'
    }));
  };

  const handlePinMessage = (messageId) => {
    if (!socket) return;
    socket.emit('pin-message', { roomId, messageId });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0 && hasMore && !isLoading) {
        loadMessages(); // Load more messages when scrolling to top
      }
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadMessages}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${isEmbedded ? '' : 'rounded-lg shadow-md'}`}>
      {/* Chat Header */}
      {!isEmbedded && (
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">Chat</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading && page === 1 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {messageGroups.map((group, index) => (
          <div key={index}>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
              </span>
            </div>

            {/* Messages */}
            {group.messages.map((message, msgIndex) => {
              const showAvatar = msgIndex === 0 || 
                group.messages[msgIndex - 1]?.sender?._id !== message.sender?._id;
              
              return (
                <Message
                  key={message._id}
                  message={message}
                  isOwnMessage={message.sender?._id === user?._id}
                  showAvatar={showAvatar}
                  onDelete={handleDeleteMessage}
                  onEdit={handleEditMessage}
                  onReact={handleReactToMessage}
                  onReport={handleReportMessage}
                  onPin={handlePinMessage}
                  previousMessage={group.messages[msgIndex - 1]}
                  nextMessage={group.messages[msgIndex + 1]}
                />
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <TypingIndicator users={Array.from(typingUsers)} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!socket}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatBox;