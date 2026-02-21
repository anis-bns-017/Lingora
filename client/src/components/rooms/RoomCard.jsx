import React, { useState } from 'react';
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
  Languages,
  Mic,
  Headphones,
  Star,
  Calendar,
  Eye,
  EyeOff,
  Volume2,
  Shield,
  Award,
  TrendingUp,
  PlusCircle,
  Info
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Tooltip from '../ui/Tooltip';

const RoomCard = ({ room }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const participantCount = room.participants?.length || 0;
  const maxParticipants = room.maxParticipants || 20;
  const progress = (participantCount / maxParticipants) * 100;
  
  // Get participant roles
  const speakers = room.participants?.filter(p => p.role === 'speaker') || [];
  const listeners = room.participants?.filter(p => p.role === 'listener') || [];

  // Get first 5 participants for avatars
  const visibleParticipants = room.participants?.slice(0, 5) || [];
  const remainingCount = participantCount - 5;

  // Format time
  const startTime = room.startTime ? new Date(room.startTime) : null;
  const isLive = room.isActive && participantCount > 0;
  const timeAgo = startTime ? getTimeAgo(startTime) : null;

  // Calculate room popularity score (example logic)
  const popularityScore = Math.min(Math.round((participantCount / maxParticipants) * 100), 100);
  
  // Get room level (based on participants' levels or default)
  const roomLevel = room.level || getRoomLevel(room.language, room.topic);

  return (
    <Link 
      to={`/room/${room._id}`} 
      className="block group outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1">
        {/* Room Header with Gradient and Pattern */}
        <div className="relative h-32 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 overflow-hidden">
          {/* Animated Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white rounded-full animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full opacity-5"></div>
          </div>

          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>LIVE</span>
              </div>
            </div>
          )}

          {/* Popularity Badge */}
          {popularityScore > 70 && (
            <div className="absolute top-3 right-3 z-10">
              <Tooltip content="High demand room">
                <div className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  <TrendingUp size={12} />
                  <span>HOT</span>
                </div>
              </Tooltip>
            </div>
          )}

          {/* Host Info Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center space-x-2">
              <Avatar 
                src={!imageError ? room.host?.avatar : null}
                alt={room.host?.username}
                size="md"
                className="border-2 border-white shadow-xl ring-2 ring-white/50 group-hover:scale-110 transition-transform"
                onError={() => setImageError(true)}
              />
              <div className="text-blue-700">
                <p className="font-bold text-sm drop-shadow-lg">{room.host?.username}</p>
                <p className="text-xs text-white/80 flex items-center">
                  <Shield size={10} className="mr-1" />
                  Host
                </p>
              </div>
            </div>

            {/* Room Type Icon with Tooltip */}
            <Tooltip content={room.isPrivate ? 'Private Room' : 'Public Room'}>
              <div className={`p-1.5 rounded-full ${
                room.isPrivate ? 'bg-yellow-400/90' : 'bg-green-400/90'
              } backdrop-blur-sm`}>
                {room.isPrivate ? 
                  <Lock size={14} className="text-yellow-900" /> : 
                  <Globe size={14} className="text-green-900" />
                }
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Room Content */}
        <div className="p-5">
          {/* Room Name and Level */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">
                {room.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="primary" size="sm" className="flex items-center space-x-1">
                  <Languages size={12} />
                  <span>{room.language}</span>
                </Badge>
                <Badge variant="secondary" size="sm" className="flex items-center space-x-1">
                  <MessageCircle size={12} />
                  <span>{room.topic}</span>
                </Badge>
              </div>
            </div>
            
            {/* Room Level Badge */}
            <Tooltip content={`${roomLevel} level`}>
              <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                roomLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
                roomLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                roomLevel === 'Advanced' ? 'bg-orange-100 text-orange-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {roomLevel}
              </div>
            </Tooltip>
          </div>

          {/* Description with Read More */}
          {room.description && (
            <div className="mb-3">
              <p className="text-gray-600 text-sm line-clamp-2">
                {room.description}
              </p>
              {room.description.length > 100 && (
                <button className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium">
                  Read more
                </button>
              )}
            </div>
          )}

          {/* Tags with Icons */}
          {room.tags && room.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {room.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Tag size={10} className="mr-1" />
                  {tag}
                </span>
              ))}
              {room.tags.length > 4 && (
                <Tooltip content={`+${room.tags.length - 4} more tags`}>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg cursor-help">
                    +{room.tags.length - 4}
                  </span>
                </Tooltip>
              )}
            </div>
          )}

          {/* Participants Stats */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center space-x-3">
                <Tooltip content="Speakers">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Mic size={14} />
                    <span className="font-medium">{speakers.length}</span>
                  </div>
                </Tooltip>
                <Tooltip content="Listeners">
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Headphones size={14} />
                    <span className="font-medium">{listeners.length}</span>
                  </div>
                </Tooltip>
                <Tooltip content="Total participants">
                  <div className="flex items-center space-x-1 text-purple-600">
                    <Users size={14} />
                    <span className="font-medium">{participantCount}/{maxParticipants}</span>
                  </div>
                </Tooltip>
              </div>
              
              {/* Capacity Indicator */}
              <Tooltip content={`${Math.round(progress)}% full`}>
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              </Tooltip>
            </div>

            {/* Animated Progress Bar */}
            <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 h-full rounded-full transition-all duration-500 group-hover:from-primary-600 group-hover:via-primary-500 group-hover:to-primary-600"
                style={{ width: `${progress}%` }}
              >
                {isHovered && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Participant Avatars Row */}
          {participantCount > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-2">
                  {visibleParticipants.map((participant, index) => (
                    <Tooltip key={participant.user?._id || index} content={participant.user?.username}>
                      <div
                        className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm hover:z-10 transition-transform hover:scale-110"
                        style={{ zIndex: visibleParticipants.length - index }}
                      >
                        {participant.user?.avatar ? (
                          <img
                            src={participant.user.avatar}
                            alt={participant.user.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${participant.user.username}&background=6366f1&color=fff&bold=true`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                            <User size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  ))}
                  {remainingCount > 0 && (
                    <Tooltip content={`${remainingCount} more participants`}>
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium shadow-sm hover:bg-gray-200 transition-colors">
                        +{remainingCount}
                      </div>
                    </Tooltip>
                  )}
                </div>
                {participantCount > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    {participantCount} {participantCount === 1 ? 'person' : 'people'}
                  </span>
                )}
              </div>

              {/* Join Button (visible on hover) */}
              <div className={`transform transition-all duration-300 ${
                isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
              }`}>
                <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg hover:bg-primary-700">
                  <PlusCircle size={16} />
                </div>
              </div>
            </div>
          )}

          {/* Footer with Additional Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Created/Started Time */}
            <div className="flex items-center text-xs text-gray-400">
              <Clock size={12} className="mr-1" />
              <span>
                {room.createdAt ? new Date(room.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                }) : 'Recently'}
              </span>
            </div>

            {/* Interactive Stats */}
            <div className="flex items-center space-x-3">
              {/* Views/Likes (placeholder) */}
              <div className="flex items-center text-xs text-gray-400">
                <Eye size={12} className="mr-1" />
                <span>{room.views || Math.floor(Math.random() * 100) + 50}</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Star size={12} className="mr-1" />
                <span>{room.likes || Math.floor(Math.random() * 20) + 5}</span>
              </div>
            </div>

            {/* View Details Link */}
            <div className="flex items-center text-primary-600 font-medium text-sm group/link">
              <span className="mr-1">Join</span>
              <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Host Verification Badge (if applicable) */}
          {room.host?.verified && (
            <div className="absolute top-20 right-3">
              <Tooltip content="Verified Host">
                <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg">
                  <Award size={12} />
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Helper function to get time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  
  return 'just now';
};

// Helper function to determine room level
const getRoomLevel = (language, topic) => {
  // This could be based on room data or default logic
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  
  // Example logic based on topic
  if (topic.toLowerCase().includes('beginner')) return 'Beginner';
  if (topic.toLowerCase().includes('advanced')) return 'Advanced';
  if (topic.toLowerCase().includes('intermediate')) return 'Intermediate';
  
  // Default based on participant count or random
  return levels[Math.floor(Math.random() * levels.length)];
};

export default RoomCard;