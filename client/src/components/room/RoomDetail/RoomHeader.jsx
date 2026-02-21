import React from 'react';
import { FaChevronLeft, FaChevronRight, FaShare, FaFlag, FaSignOutAlt } from 'react-icons/fa';
import Badge from '../../ui/Badge';
import Tooltip from '../../ui/Tooltip';
import Button from '../../ui/Button';

const RoomHeader = ({ room, participantsCount, onLeave, onToggleSidebar, isSidebarOpen }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white transition"
        >
          {isSidebarOpen ? <FaChevronLeft size={18} /> : <FaChevronRight size={18} />}
        </button>
        
        <div>
          <h1 className="text-xl font-bold text-white">{room.name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="primary" size="sm">{room.language}</Badge>
            <Badge variant="secondary" size="sm">{room.topic}</Badge>
            <span className="text-sm text-gray-400">
              Hosted by {room.host?.username}
            </span>
            <span className="text-sm text-gray-500">
              · {participantsCount} participants
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Tooltip content="Share room">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <FaShare size={18} />
          </button>
        </Tooltip>
        
        <Tooltip content="Report room">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <FaFlag size={18} />
          </button>
        </Tooltip>
        
        <Button
          variant="danger"
          size="sm"
          onClick={onLeave}
          className="flex items-center space-x-2"
        >
          <FaSignOutAlt size={16} />
          <span>Leave</span>
        </Button>
      </div>
    </div>
  );
};

export default RoomHeader;