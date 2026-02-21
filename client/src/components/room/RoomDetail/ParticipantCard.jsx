import React, { useState } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHeadphones,
  FaBan,
  FaFlag,
  FaVolumeUp,
  FaVolumeMute,
  FaChevronUp,
  FaChevronDown,
  FaStar
} from 'react-icons/fa';
import Avatar from '../../ui/Avatar';
import Tooltip from '../../ui/Tooltip';
import Badge from '../../ui/Badge';

const ParticipantCard = ({ 
  participant, 
  isSpeaking, 
  isCurrentUser, 
  isHost,
  isModerator,
  onReport,
  onKick,
  onMute,
  onPromote,
  onDemote
}) => {
  const [showActions, setShowActions] = useState(false);
  const [individualVolume, setIndividualVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const user = participant.user;
  const canModerate = (isHost || isModerator) && !isCurrentUser;

  return (
    <div
      className={`relative group bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all ${
        isSpeaking ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowVolumeSlider(false);
      }}
    >
      {/* Avatar Section */}
      <div className="relative mb-3">
        <Avatar
          src={user?.avatar}
          alt={user?.username}
          size="lg"
          className="mx-auto"
        />
        
        {/* Role Indicator */}
        {participant.role === 'speaker' && (
          <Tooltip content="Speaker">
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <FaVolumeUp size={10} className="text-white" />
            </div>
          </Tooltip>
        )}
        
        {/* Mute Indicator */}
        {participant.isMuted && (
          <Tooltip content="Muted">
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <FaMicrophoneSlash size={10} className="text-white" />
            </div>
          </Tooltip>
        )}

        {/* Host Badge */}
        {user?._id === participant.hostId && (
          <Tooltip content="Host">
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <FaStar size={10} className="text-white" />
            </div>
          </Tooltip>
        )}
      </div>

      {/* User Info */}
      <div className="text-center">
        <p className="text-white font-medium text-sm truncate">
          {user?.username}
          {isCurrentUser && ' (You)'}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {participant.role}
        </p>
      </div>

      {/* Speaking Animation */}
      {isSpeaking && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-5 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Hover Actions */}
      {showActions && (
        <div className="absolute inset-0 bg-black/50 rounded-lg backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2">
            {/* Individual Volume */}
            <Tooltip content="Adjust volume">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition"
              >
                {individualVolume === 0 ? 
                  <FaVolumeMute size={14} className="text-white" /> : 
                  <FaVolumeUp size={14} className="text-white" />
                }
              </button>
            </Tooltip>

            {/* Report (available to everyone) */}
            {!isCurrentUser && (
              <Tooltip content="Report">
                <button
                  onClick={() => onReport(user)}
                  className="p-2 bg-orange-600 rounded-full hover:bg-orange-700 transition"
                >
                  <FaFlag size={14} className="text-white" />
                </button>
              </Tooltip>
            )}

            {/* Moderation Actions (host/moderator only) */}
            {canModerate && (
              <>
                <Tooltip content={participant.isMuted ? 'Unmute' : 'Mute'}>
                  <button
                    onClick={() => onMute(user?._id)}
                    className="p-2 bg-yellow-600 rounded-full hover:bg-yellow-700 transition"
                  >
                    {participant.isMuted ? 
                      <FaMicrophone size={14} className="text-white" /> : 
                      <FaMicrophoneSlash size={14} className="text-white" />
                    }
                  </button>
                </Tooltip>

                <Tooltip content="Kick">
                  <button
                    onClick={() => onKick(user?._id)}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                  >
                    <FaBan size={14} className="text-white" />
                  </button>
                </Tooltip>

                {/* Promote/Demote */}
                {participant.role === 'listener' ? (
                  <Tooltip content="Promote to speaker">
                    <button
                      onClick={() => onPromote(user?._id)}
                      className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition"
                    >
                      <FaChevronUp size={14} className="text-white" />
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip content="Demote to listener">
                    <button
                      onClick={() => onDemote(user?._id)}
                      className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition"
                    >
                      <FaChevronDown size={14} className="text-white" />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 shadow-xl">
              <input
                type="range"
                min="0"
                max="100"
                value={individualVolume}
                onChange={(e) => setIndividualVolume(parseInt(e.target.value))}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;