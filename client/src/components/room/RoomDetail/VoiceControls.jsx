import React, { useState } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHeadphones, 
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  FaVolumeOff
} from 'react-icons/fa';
import Tooltip from '../../ui/Tooltip';
import Badge from '../../ui/Badge';
import VolumeControl from './VolumeControl';

const VoiceControls = ({ 
  isMuted, 
  isDeafened, 
  volume, 
  audioEnabled, 
  participantsCount,
  onToggleMute, 
  onToggleDeaf, 
  onVolumeChange 
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const VolumeIcon = volume === 0 ? FaVolumeOff : 
                    volume < 50 ? FaVolumeDown : 
                    FaVolumeUp;

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mute Button */}
          <Tooltip content={isMuted ? 'Unmute (Ctrl+M)' : 'Mute (Ctrl+M)'}>
            <button
              onClick={onToggleMute}
              disabled={!audioEnabled}
              className={`p-3 rounded-xl transition-all ${
                !audioEnabled ? 'opacity-50 cursor-not-allowed' :
                isMuted ? 'bg-red-600 text-white hover:bg-red-700' : 
                'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
          </Tooltip>

          {/* Deafen Button */}
          <Tooltip content={isDeafened ? 'Undeafen (Ctrl+D)' : 'Deafen (Ctrl+D)'}>
            <button
              onClick={onToggleDeaf}
              className={`p-3 rounded-xl transition-all ${
                isDeafened ? 'bg-red-600 text-white hover:bg-red-700' : 
                'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {isDeafened ? <FaVolumeMute size={20} /> : <FaHeadphones size={20} />}
            </button>
          </Tooltip>

          {/* Volume Button */}
          <div className="relative">
            <Tooltip content="Adjust volume">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all"
              >
                <VolumeIcon size={20} />
              </button>
            </Tooltip>
            
            {showVolumeSlider && (
              <VolumeControl
                volume={volume}
                onVolumeChange={onVolumeChange}
                onClose={() => setShowVolumeSlider(false)}
              />
            )}
          </div>

          {/* Participants Count */}
          <div className="ml-2 px-3 py-2 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">
              <span className="font-bold text-white">{participantsCount}</span> in room
            </span>
          </div>
        </div>

        {/* Audio Status */}
        <div className="flex items-center space-x-2">
          <Badge variant={audioEnabled ? 'success' : 'warning'} size="sm">
            {audioEnabled ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Audio Connected
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Audio Disabled
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;