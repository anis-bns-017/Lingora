import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Lock, 
  Globe, 
  User,
  MessageCircle,
  Tag,
  Clock,
  ChevronRight,
  Languages
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const RoomCard = ({ room }) => {
  const participantCount = room.participants?.length || 0;
  const maxParticipants = room.maxParticipants || 20;
  const progress = (participantCount / maxParticipants) * 100;

  // Get first 3 participants for avatars
  const visibleParticipants = room.participants?.slice(0, 3) || [];
  const remainingCount = participantCount - 3;

  // Format time (if room has start time)
  const startTime = room.startTime ? new Date(room.startTime) : null;
  const isLive = room.isActive && participantCount > 0;

  return (
    <Link to={`/room/${room._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200">
        {/* Room Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white rounded-full"></div>
          </div>

          <div className="relative flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar 
                src={room.host?.avatar} 
                alt={room.host?.username}
                size="md"
                className="border-2 border-white shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:underline text-lg">
                  {room.name}
                </h3>
                <div className="flex items-center text-xs text-primary-100">
                  <User size={12} className="mr-1" />
                  <span className="truncate">Hosted by {room.host?.username}</span>
                </div>
              </div>
            </div>
            
            {/* Room Type Badge */}
            <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
              room.isPrivate 
                ? 'bg-yellow-400 text-yellow-900' 
                : 'bg-green-400 text-green-900'
            }`}>
              {room.isPrivate ? (
                <>
                  <Lock size={12} />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe size={12} />
                  <span>Public</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Room Content */}
        <div className="p-4">
          {/* Language and Topic */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Languages size={16} className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700">{room.language}</span>
            </div>
            <Badge variant="secondary" size="sm" className="flex items-center space-x-1">
              <MessageCircle size={12} />
              <span>{room.topic}</span>
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
                  className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  <Tag size={10} className="mr-1" />
                  {tag}
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
                <Users size={16} className="text-gray-400" />
                <span className="text-gray-600 font-medium">
                  {participantCount}/{maxParticipants}
                </span>
              </div>
              
              {/* Participant Avatars */}
              {participantCount > 0 && (
                <div className="flex -space-x-2">
                  {visibleParticipants.map((participant, index) => (
                    <div
                      key={participant.user?._id || index}
                      className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm"
                      title={participant.user?.username}
                    >
                      {participant.user?.avatar ? (
                        <img
                          src={participant.user.avatar}
                          alt={participant.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <User size={12} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium shadow-sm">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 group-hover:from-primary-600 group-hover:to-primary-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            {/* Live Indicator */}
            {isLive ? (
              <div className="flex items-center text-xs text-green-600 font-medium">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live now
              </div>
            ) : (
              <div className="flex items-center text-xs text-gray-400">
                <Clock size={12} className="mr-1" />
                <span>Not active</span>
              </div>
            )}

            {/* View Details Arrow */}
            <div className="text-primary-600 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;