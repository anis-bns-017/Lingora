// components/room/RoomDetail/RoomHeader.jsx
import React, { useState } from 'react';
import { 
  FaShare, 
  FaFlag, 
  FaSignOutAlt,
  FaUsers,
  FaCopy,
  FaCheck,
  FaEllipsisH,
  FaVolumeUp,
  FaMicrophone,
  FaShieldAlt
} from 'react-icons/fa';
import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';
import Tooltip from '../../ui/Tooltip';

const RoomHeader = ({ room, participantCount, onLeave }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left section - Room info */}
        <div className="flex items-center gap-6">
          {/* Room icon/avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">🎙️</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white">{room.name}</h1>
              <Badge variant="primary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {room.language}
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                {room.topic}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <FaUsers size={14} />
                {participantCount} participants
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                <FaMicrophone size={14} />
                {room.participants?.filter(p => p.role === 'speaker').length || 0} speakers
              </span>
              {room.isPrivate && (
                <span className="text-yellow-500 flex items-center gap-1">
                  <FaShieldAlt size={14} />
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Host info - like Hilokal shows host in header */}
          <div className="flex items-center gap-3 mr-4 pr-4 border-r border-gray-700">
            <Avatar src={room.host?.avatar} alt={room.host?.username} size="sm" />
            <div>
              <p className="text-xs text-gray-400">Hosted by</p>
              <p className="text-sm font-medium text-white flex items-center gap-1">
                {room.host?.username}
                {room.host?.verified && (
                  <span className="text-blue-400 text-xs">✓</span>
                )}
              </p>
            </div>
          </div>

          {/* Share button */}
          <div className="relative">
            <Tooltip content="Share room">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 hover:bg-gray-800 rounded-lg transition"
              >
                <FaShare className="text-gray-400" size={18} />
              </button>
            </Tooltip>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-3 z-50">
                <p className="text-sm text-gray-300 mb-2">Invite people</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 bg-gray-700 text-white text-sm p-2 rounded-lg"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report button */}
          <Tooltip content="Report">
            <button className="p-2.5 hover:bg-gray-800 rounded-lg transition">
              <FaFlag className="text-gray-400" size={18} />
            </button>
          </Tooltip>

          {/* More options */}
          <Tooltip content="More options">
            <button className="p-2.5 hover:bg-gray-800 rounded-lg transition">
              <FaEllipsisH className="text-gray-400" size={18} />
            </button>
          </Tooltip>

          {/* Leave button */}
          <Tooltip content="Leave quietly">
            <button
              onClick={onLeave}
              className="ml-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition flex items-center gap-2"
            >
              <FaSignOutAlt size={16} />
              <span className="text-sm font-medium">Leave</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;