import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  VolumeX,
  LogOut,
  Users,
  MessageSquare,
  UserPlus,
  Shield,
  Volume2,
  Volume1,
  Volume,
  Settings,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Crown,
  Speaker,
  Radio
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import ChatBox from '../chat/ChatBox';
import toast from 'react-hot-toast';

const VoiceRoom = ({ room, socket, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [participants, setParticipants] = useState(room.participants || []);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [showParticipants, setShowParticipants] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState([]);
  
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const peerConnections = useRef({});
  const volumeSliderRef = useRef(null);

  useEffect(() => {
    // Request microphone access
    const setupVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        
        // Mute initially
        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });

        // Setup audio context for volume monitoring
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        source.connect(analyser);
        
        // Monitor speaking
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkSpeaking = () => {
          if (audioContextRef.current && !isMuted) {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const isSpeaking = average > 10; // Threshold
            
            if (isSpeaking !== speakingUsers.has(socket?.user?._id)) {
              if (isSpeaking) {
                setSpeakingUsers(prev => new Set([...prev, socket?.user?._id]));
                setActiveSpeakers(prev => [...prev, socket?.user?._id]);
              } else {
                setSpeakingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(socket?.user?._id);
                  return newSet;
                });
                setActiveSpeakers(prev => prev.filter(id => id !== socket?.user?._id));
              }
              socket?.emit('speaking', { 
                roomId: room._id, 
                isSpeaking 
              });
            }
          }
          requestAnimationFrame(checkSpeaking);
        };
        checkSpeaking();

        setAudioEnabled(true);
        toast.success('Microphone access granted');
      } catch (error) {
        console.error('Failed to get microphone access:', error);
        toast.error('Please allow microphone access to speak in the room');
        setAudioEnabled(false);
      }
    };

    setupVoice();

    // Socket event listeners
    if (socket) {
      socket.on('user-joined', ({ user, participants: updatedParticipants }) => {
        setParticipants(updatedParticipants);
        toast.success(`${user.username} joined the room`);
      });

      socket.on('user-left', ({ userId, username }) => {
        setParticipants(prev => prev.filter(p => p.user?._id !== userId));
        setSpeakingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        setActiveSpeakers(prev => prev.filter(id => id !== userId));
        toast.info(`${username} left the room`);
      });

      socket.on('user-muted', ({ userId, muted }) => {
        setParticipants(prev => prev.map(p => 
          p.user?._id === userId ? { ...p, isMuted: muted } : p
        ));
      });

      socket.on('speaking', ({ userId, isSpeaking }) => {
        setSpeakingUsers(prev => {
          const newSet = new Set(prev);
          if (isSpeaking) {
            newSet.add(userId);
            setActiveSpeakers(prev => [...prev, userId]);
          } else {
            newSet.delete(userId);
            setActiveSpeakers(prev => prev.filter(id => id !== userId));
          }
          return newSet;
        });
      });

      socket.on('user-kicked', ({ userId, kickedBy }) => {
        if (userId === socket.user?._id) {
          toast.error(`You were kicked from the room by ${kickedBy}`);
          onLeave();
        } else {
          setParticipants(prev => prev.filter(p => p.user?._id !== userId));
          toast.info(`User was kicked by ${kickedBy}`);
        }
      });

      socket.on('participant-role-updated', ({ userId, role }) => {
        setParticipants(prev => prev.map(p => 
          p.user?._id === userId ? { ...p, role } : p
        ));
      });

      socket.on('error', ({ message }) => {
        toast.error(message);
      });
    }

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      Object.values(peerConnections.current).forEach(pc => pc.close());
      
      if (socket) {
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('user-muted');
        socket.off('speaking');
        socket.off('user-kicked');
        socket.off('participant-role-updated');
        socket.off('error');
      }
    };
  }, [socket, room._id]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      
      // Notify others
      socket?.emit('toggle-mute', { roomId: room._id, muted: !isMuted });
      
      toast.success(!isMuted ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const toggleDeaf = () => {
    setIsDeafened(!isDeafened);
    // Mute all audio outputs
    if (localStreamRef.current) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.muted = !isDeafened;
      });
    }
    toast.success(!isDeafened ? 'Sound muted' : 'Sound unmuted');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    // Adjust all audio elements volume
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume / 100;
    });
  };

  const handleKickUser = (userId) => {
    if (window.confirm('Are you sure you want to kick this user?')) {
      socket?.emit('kick-user', { roomId: room._id, userId });
    }
  };

  const handleChangeRole = (userId, role) => {
    socket?.emit('change-role', { roomId: room._id, userId, role });
  };

  const getVolumeIcon = () => {
    if (volume === 0 || isDeafened) return <VolumeX className="text-gray-400" size={20} />;
    if (volume < 30) return <Volume size={20} />;
    if (volume < 70) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  const isHost = socket?.user?._id === room.host?._id;
  const isModerator = room.moderators?.includes(socket?.user?._id) || isHost;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-900 rounded-lg overflow-hidden">
      {/* Main Content - Voice Room */}
      <div className="flex-1 flex flex-col">
        {/* Room Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Radio className="text-primary-400" size={20} />
              <span>{room.name}</span>
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">
                Hosted by {room.host?.username}
              </span>
              <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                {room.language}
              </span>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                {room.topic}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-gray-300 hover:text-white"
            >
              {showParticipants ? <MessageSquare size={20} /> : <Users size={20} />}
            </Button>
            <Button
              variant="danger"
              onClick={onLeave}
              className="flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Leave</span>
            </Button>
          </div>
        </div>

        {/* Active Speakers Bar */}
        {activeSpeakers.length > 0 && (
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Speaker className="text-green-400 animate-pulse" size={16} />
              <span className="text-sm text-gray-300">Speaking:</span>
              <div className="flex space-x-1">
                {activeSpeakers.map(speakerId => {
                  const speaker = participants.find(p => p.user?._id === speakerId);
                  return speaker ? (
                    <span key={speakerId} className="text-sm text-green-400 font-medium">
                      {speaker.user?.username}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Participants Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {participants.map((participant) => {
              const isSpeaking = speakingUsers.has(participant.user?._id);
              const isCurrentUser = participant.user?._id === socket?.user?._id;
              
              return (
                <div
                  key={participant.user?._id}
                  className={`
                    relative group
                    ${isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900' : ''}
                    ${participant.isMuted ? 'opacity-75' : ''}
                  `}
                >
                  <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar
                        src={participant.user?.avatar}
                        alt={participant.user?.username}
                        size="xl"
                        className="mx-auto mb-2"
                      />
                      
                      {/* Role Badge */}
                      {participant.role === 'speaker' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs">🎤</span>
                        </div>
                      )}
                      
                      {/* Host Crown */}
                      {participant.user?._id === room.host?._id && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <Crown size={12} className="text-white" />
                        </div>
                      )}
                      
                      {/* Mute Indicator */}
                      {participant.isMuted && (
                        <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1">
                          <MicOff size={12} className="text-white" />
                        </div>
                      )}

                      {/* Speaking Animation */}
                      {isSpeaking && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <p className="text-center text-white font-medium truncate">
                      {participant.user?.username}
                      {isCurrentUser && ' (You)'}
                    </p>
                    <p className="text-center text-gray-400 text-xs capitalize">
                      {participant.role}
                    </p>

                    {/* Moderator Actions */}
                    {isModerator && !isCurrentUser && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleChangeRole(
                            participant.user?._id, 
                            participant.role === 'speaker' ? 'listener' : 'speaker'
                          )}
                          className="p-2 bg-primary-600 rounded-full hover:bg-primary-700"
                          title="Toggle speaker role"
                        >
                          {participant.role === 'speaker' ? (
                            <MicOff size={14} className="text-white" />
                          ) : (
                            <Mic size={14} className="text-white" />
                          )}
                        </button>
                        <button
                          onClick={() => handleKickUser(participant.user?._id)}
                          className="p-2 bg-red-600 rounded-full hover:bg-red-700"
                          title="Kick user"
                        >
                          <LogOut size={14} className="text-white" />
                        </button>
                        <button
                          className="p-2 bg-gray-600 rounded-full hover:bg-gray-700"
                          title="More options"
                        >
                          <MoreVertical size={14} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice Controls */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="container mx-auto flex justify-center items-center space-x-4">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              disabled={!audioEnabled}
              className={`
                p-4 rounded-full transition relative
                ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }
              `}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
            </button>

            {/* Deaf Button */}
            <button
              onClick={toggleDeaf}
              className={`
                p-4 rounded-full transition relative
                ${isDeafened 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }
              `}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              {isDeafened ? <VolumeX className="text-white" size={24} /> : <Headphones className="text-white" size={24} />}
            </button>

            {/* Volume Control */}
            <div className="relative" ref={volumeSliderRef}>
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                title="Adjust volume"
              >
                {getVolumeIcon()}
              </button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 rounded-lg p-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
                    }}
                  />
                  <div className="text-center text-white text-xs mt-1">{volume}%</div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"
              title="Audio settings"
            >
              <Settings className="text-white" size={20} />
            </button>
          </div>

          {/* Connection Status */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">
              {audioEnabled ? 'Connected' : 'No microphone'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showParticipants ? (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <ChatBox roomId={room._id} socket={socket} isEmbedded={true} />
        </div>
      ) : (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Participants List Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold flex items-center space-x-2">
              <Users size={18} />
              <span>Participants ({participants.length})</span>
            </h3>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {participants.map((participant) => {
                const isSpeaking = speakingUsers.has(participant.user?._id);
                const isCurrentUser = participant.user?._id === socket?.user?._id;
                
                return (
                  <div
                    key={participant.user?._id}
                    className={`
                      flex items-center justify-between p-2 rounded-lg
                      ${isSpeaking ? 'bg-gray-700' : 'hover:bg-gray-700'}
                      transition cursor-pointer
                    `}
                    onClick={() => setSelectedParticipant(participant.user)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Avatar
                          src={participant.user?.avatar}
                          alt={participant.user?.username}
                          size="sm"
                        />
                        {isSpeaking && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium flex items-center space-x-1">
                          <span>{participant.user?.username}</span>
                          {isCurrentUser && <span className="text-xs text-gray-400">(You)</span>}
                          {participant.user?._id === room.host?._id && (
                            <Crown size={12} className="text-yellow-500" />
                          )}
                        </p>
                        <p className="text-gray-400 text-xs capitalize">{participant.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {participant.isMuted && (
                        <MicOff size={14} className="text-red-500" />
                      )}
                      {participant.role === 'speaker' && (
                        <Mic size={14} className="text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participants Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Speaking</span>
              </div>
              <div className="flex items-center space-x-2">
                <MicOff size={12} className="text-red-500" />
                <span>Muted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRoom;