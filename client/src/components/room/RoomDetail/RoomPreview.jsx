import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaChevronLeft } from 'react-icons/fa';
import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const RoomPreview = ({ 
  room, 
  showPasswordInput, 
  password, 
  setPassword, 
  onJoin, 
  onBack, 
  isAuthenticated 
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <FaChevronLeft className="mr-2" size={16} />
        Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">{room.language}</Badge>
                <Badge variant="secondary">{room.topic}</Badge>
                {room.isPrivate && (
                  <Badge variant="warning">Private Room</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <FaUsers className="text-white" size={16} />
              <span className="text-white font-medium">
                {room.participants?.length || 0} / {room.maxParticipants}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Host Info */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar src={room.host?.avatar} alt={room.host?.username} size="lg" />
            <div>
              <p className="text-sm text-gray-500">Hosted by</p>
              <p className="font-semibold text-lg">{room.host?.username}</p>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">About this room</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {room.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {room.tags?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {room.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">#{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Join Section */}
          <div className="border-t pt-6">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Please log in to join this room</p>
                <Link to="/login">
                  <Button size="lg">Log In to Join</Button>
                </Link>
              </div>
            ) : showPasswordInput ? (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <Button onClick={onJoin} className="flex-1">
                    Join Room
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={onJoin} size="lg" className="w-full">
                Join Room
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPreview;