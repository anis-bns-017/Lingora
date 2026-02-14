import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaLock, FaGlobe } from 'react-icons/fa';
import Avatar from '../ui/Avatar';

const RoomCard = ({ room }) => {
  const participantCount = room.participants?.length || 0;
  const maxParticipants = room.maxParticipants || 20;
  const progress = (participantCount / maxParticipants) * 100;

  return (
    <Link to={`/room/${room._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <Avatar src={room.host?.avatar} alt={room.host?.username} size="md" />
            <div>
              <h3 className="font-semibold text-gray-800">{room.name}</h3>
              <p className="text-sm text-gray-500">Hosted by {room.host?.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {room.isPrivate ? (
              <FaLock className="text-gray-400" />
            ) : (
              <FaGlobe className="text-green-500" />
            )}
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {room.language}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <FaUsers className="text-gray-400" />
            <span className="text-gray-600">
              {participantCount}/{maxParticipants}
            </span>
          </div>
          <span className="text-primary-600 font-medium">{room.topic}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Tags */}
        {room.tags && room.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {room.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RoomCard;