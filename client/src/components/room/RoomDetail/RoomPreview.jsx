// components/room/RoomDetail/RoomPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUsers, 
  FaGlobe, 
  FaLock,
  FaMicrophone,
  FaHeadphones,
  FaChevronRight,
  FaUserCircle,
  FaTag,
  FaInfoCircle,
  FaShieldAlt,
  FaCrown,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';
import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

const RoomPreview = ({ 
  room, 
  showPasswordInput, 
  password, 
  setPassword, 
  onJoin, 
  onBack, 
  isAuthenticated,
  isJoining 
}) => {
  // Format date
  const createdDate = room.createdAt ? new Date(room.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
            <span>Back to Rooms</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Like Hilokal's room header */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20" />
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
                }}
              />
            </div>

            {/* Room type badge */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                room.isPrivate 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {room.isPrivate ? <FaLock size={10} /> : <FaGlobe size={10} />}
                <span>{room.isPrivate ? 'Private Room' : 'Public Room'}</span>
              </div>
            </div>

            {/* Room info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                      {room.language}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                      {room.topic}
                    </Badge>
                    <span className="text-sm text-white/80 flex items-center gap-1">
                      <FaUsers size={14} />
                      {room.participants?.length || 0}/{room.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content grid - 2 columns like Hilokal */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left column - Main info */}
            <div className="md:col-span-2 space-y-6">
              {/* Host card */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start gap-4">
                  <Avatar 
                    src={room.host?.avatar} 
                    alt={room.host?.username}
                    size="xl"
                    className="ring-4 ring-indigo-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold">{room.host?.username}</h2>
                      <Badge variant="primary" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        <FaCrown className="mr-1" size={10} />
                        Host
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Hosting since {createdDate}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <FaUsers size={12} />
                        {room.host?.followers || 0} followers
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <FaClock size={12} />
                        {room.host?.roomsHosted || 0} rooms hosted
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About this room */}
              {room.description && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-indigo-400" />
                    About this room
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{room.description}</p>
                </div>
              )}

              {/* Tags */}
              {room.tags?.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaTag className="text-indigo-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition cursor-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants preview */}
              {room.participants?.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaUsers className="text-indigo-400" />
                    Already inside ({room.participants.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.participants.slice(0, 8).map((p, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <Avatar 
                          src={p.user?.avatar} 
                          alt={p.user?.username}
                          size="sm"
                          className="ring-2 ring-gray-700"
                        />
                        <span className="text-xs text-gray-400 mt-1 max-w-[50px] truncate">
                          {p.user?.username}
                        </span>
                      </div>
                    ))}
                    {room.participants.length > 8 && (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                        +{room.participants.length - 8}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Join card */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Join the conversation</h3>
                
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">Sign in to join this room and start speaking with others.</p>
                    <Link to="/login">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Sign In to Join
                      </Button>
                    </Link>
                  </div>
                ) : showPasswordInput ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                      <input
                        type="password"
                        placeholder="Enter room password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={onJoin}
                        disabled={isJoining}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium disabled:opacity-50"
                      >
                        {isJoining ? 'Joining...' : 'Join'}
                      </button>
                      <button
                        onClick={() => setPassword('')}
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={onJoin}
                      disabled={isJoining}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
                    >
                      <FaHeadphones size={18} />
                      {isJoining ? 'Joining...' : 'Join Room'}
                    </button>

                    {/* Room stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{room.participants?.length || 0}</div>
                        <div className="text-xs text-gray-500">Inside</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{room.maxParticipants}</div>
                        <div className="text-xs text-gray-500">Capacity</div>
                      </div>
                    </div>

                    {/* Created date */}
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <FaCalendarAlt size={10} />
                      <span>Created {createdDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPreview;