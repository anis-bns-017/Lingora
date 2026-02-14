import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaLock, FaGlobe, FaUserCircle } from 'react-icons/fa';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const RoomCard = ({ room }) => {
  const participantCount = room.participants?.length || 0;
  const maxParticipants = room.maxParticipants || 20;
  const progress = (participantCount / maxParticipants) * 100;

  // Get first 3 participants for avatars
  const visibleParticipants = room.participants?.slice(0, 3) || [];
  const remainingCount = participantCount - 3;

  return (
    <Link to={`/room/${room._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Room Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1">
              <Avatar 
                src={room.host?.avatar} 
                alt={room.host?.username}
                size="md"
                className="border-2 border-white"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:underline">
                  {room.name}
                </h3>
                <p className="text-xs text-primary-100 truncate">
                  Hosted by {room.host?.username}
                </p>
              </div>
            </div>
            
            {/* Room Type Icon */}
            <div className="ml-2">
              {room.isPrivate ? (
                <FaLock className="text-white opacity-75" size={16} />
              ) : (
                <FaGlobe className="text-white opacity-75" size={16} />
              )}
            </div>
          </div>
        </div>

        {/* Room Content */}
        <div className="p-4">
          {/* Language and Topic */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="primary" size="sm">
              {room.language}
            </Badge>
            <Badge variant="secondary" size="sm">
              {room.topic}
            </Badge>
          </div>

          {/* Description */}
          {room.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Tags */}
          {room.tags && room.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {room.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {room.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{room.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Participants Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-gray-400" size={14} />
                <span className="text-gray-600 font-medium">
                  {participantCount}/{maxParticipants}
                </span>
              </div>
              
              {/* Participant Avatars */}
              <div className="flex -space-x-2">
                {visibleParticipants.map((participant, index) => (
                  <div
                    key={participant.user?._id || index}
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                    title={participant.user?.username}
                  >
                    {participant.user?.avatar ? (
                      <img
                        src={participant.user.avatar}
                        alt={participant.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-full h-full text-gray-400" />
                    )}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status Indicator */}
          {room.isActive ? (
            <div className="mt-3 flex items-center text-xs text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
              Live now
            </div>
          ) : (
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
              Ended
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;