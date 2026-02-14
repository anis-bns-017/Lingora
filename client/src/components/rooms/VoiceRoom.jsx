import React, { useState, useEffect, useRef } from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHeadphones, 
  FaHeadphonesSlash, 
  FaSignOutAlt,
  FaUsers,
  FaComments,
  FaUserPlus,
  FaShieldAlt,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
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
  
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const peerConnections = useRef({});

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
            
            if (isSpeaking !== speakingUsers.has(socket.user?._id)) {
              if (isSpeaking) {
                setSpeakingUsers(prev => new Set([...prev, socket.user?._id]));
              } else {
                setSpeakingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(socket.user?._id);
                  return newSet;
                });
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
        toast.info(`${username} left the room`);
      });

      socket.on('user-muted', ({ userId, muted }) => {
        // Update UI for muted user
        const participant = participants.find(p => p.user?._id === userId);
        if (participant) {
          // You can add a muted indicator in the UI
        }
      });

      socket.on('speaking', ({ userId, isSpeaking }) => {
        setSpeakingUsers(prev => {
          const newSet = new Set(prev);
          if (isSpeaking) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
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
      // Implement audio output muting
    }
    toast.success(!isDeafened ? 'Sound muted' : 'Sound unmuted');
  };

  const handleKickUser = (userId) => {
    if (window.confirm('Are you sure you want to kick this user?')) {
      socket?.emit('kick-user', { roomId: room._id, userId });
    }
  };

  const handleChangeRole = (userId, role) => {
    socket?.emit('change-role', { roomId: room._id, userId, role });
  };

  const isHost = socket?.user?._id === room.host?._id;
  const isModerator = room.moderators?.includes(socket?.user?._id) || isHost;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-900 rounded-lg overflow-hidden">
      {/* Main Content - Voice Room */}
      <div className="flex-1 flex flex-col">
        {/* Room Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{room.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">
                Hosted by {room.host?.username}
              </span>
              <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                {room.language}
              </span>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
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
              {showParticipants ? <FaComments size={20} /> : <FaUsers size={20} />}
            </Button>
            <Button
              variant="danger"
              onClick={onLeave}
              className="flex items-center space-x-2"
            >
              <FaSignOutAlt />
              <span>Leave</span>
            </Button>
          </div>
        </div>

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
                    relative group cursor-pointer
                    ${isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900' : ''}
                  `}
                  onClick={() => setSelectedParticipant(participant.user)}
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
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
                      )}
                      
                      {/* Mute Indicator */}
                      {participant.isMuted && (
                        <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1">
                          <FaMicrophoneSlash size={10} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <p className="text-center text-white font-medium truncate">
                      {participant.user?.username}
                      {isCurrentUser && ' (You)'}
                    </p>
                    <p className="text-center text-gray-400 text-xs">
                      {participant.role}
                    </p>

                    {/* Host/Moderator Badge */}
                    {participant.user?._id === room.host?._id && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-xs px-2 py-0.5 rounded-full">
                        Host
                      </div>
                    )}

                    {/* Moderator Actions */}
                    {isModerator && !isCurrentUser && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeRole(participant.user?._id, 
                              participant.role === 'speaker' ? 'listener' : 'speaker'
                            );
                          }}
                          className="p-2 bg-primary-600 rounded-full hover:bg-primary-700"
                          title="Toggle speaker role"
                        >
                          <FaVolumeUp size={14} className="text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKickUser(participant.user?._id);
                          }}
                          className="p-2 bg-red-600 rounded-full hover:bg-red-700"
                          title="Kick user"
                        >
                          <FaUserPlus size={14} className="text-white rotate-45" />
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
        <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            disabled={!audioEnabled}
            className={`
              p-4 rounded-full transition
              ${!audioEnabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <FaMicrophoneSlash className="text-white text-xl" />
            ) : (
              <FaMicrophone className="text-white text-xl" />
            )}
          </button>

          {/* Deaf Button */}
          <button
            onClick={toggleDeaf}
            className={`
              p-4 rounded-full transition
              ${isDeafened 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            {isDeafened ? (
              <FaHeadphonesSlash className="text-white text-xl" />
            ) : (
              <FaHeadphones className="text-white text-xl" />
            )}
          </button>

          {/* Volume Indicator */}
          {audioEnabled && !isMuted && (
            <div className="flex items-center space-x-1">
              <FaVolumeUp className="text-gray-400" />
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${Math.random() * 30}%` }} // Replace with actual volume
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {showParticipants ? (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <ChatBox roomId={room._id} socket={socket} />
        </div>
      ) : (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <FaUsers />
            <span>Participants ({participants.length})</span>
          </h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.user?._id}
                className="flex items-center justify-between p-2 hover:bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <Avatar
                    src={participant.user?.avatar}
                    alt={participant.user?.username}
                    size="sm"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">
                      {participant.user?.username}
                    </p>
                    <p className="text-gray-400 text-xs">{participant.role}</p>
                  </div>
                </div>
                {participant.role === 'speaker' && (
                  <FaShieldAlt className="text-primary-500" size={14} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRoom;