import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaHeadphones, FaHeadphonesSlash, FaSignOutAlt } from 'react-icons/fa';
import Avatar from '../ui/Avatar';
import ChatBox from '../chat/ChatBox';
import toast from 'react-hot-toast';

const VoiceRoom = ({ room, socket, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [participants, setParticipants] = useState(room.participants || []);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const localStreamRef = useRef(null);
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
      } catch (error) {
        console.error('Failed to get microphone access:', error);
        toast.error('Please allow microphone access to speak in the room');
      }
    };

    setupVoice();

    // Socket event listeners
    if (socket) {
      socket.on('user-joined', (user) => {
        setParticipants(prev => [...prev, user]);
        toast.success(`${user.username} joined the room`);
      });

      socket.on('user-left', (userId) => {
        setParticipants(prev => prev.filter(p => p.user?._id !== userId));
        toast.info('A user left the room');
      });

      socket.on('user-muted', ({ userId, muted }) => {
        // Update UI for muted user
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
    }

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      Object.values(peerConnections.current).forEach(pc => pc.close());
      
      if (socket) {
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('user-muted');
        socket.off('speaking');
      }
    };
  }, [socket]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      
      // Notify others
      socket?.emit('toggle-mute', { roomId: room._id, muted: !isMuted });
    }
  };

  const toggleDeaf = () => {
    setIsDeafened(!isDeafened);
    // Mute all audio outputs
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Participants Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{room.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {participants.map((participant) => (
            <div
              key={participant.user?._id}
              className={`relative bg-gray-800 rounded-lg p-4 ${
                speakingUsers.has(participant.user?._id) ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <Avatar
                src={participant.user?.avatar}
                alt={participant.user?.username}
                size="lg"
                className="mx-auto mb-2"
              />
              <p className="text-center text-white font-medium">
                {participant.user?.username}
              </p>
              <p className="text-center text-gray-400 text-sm">
                {participant.role}
              </p>
              {participant.user?._id === room.host?._id && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-xs rounded">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-80 border-l border-gray-200 flex flex-col">
        <ChatBox roomId={room._id} socket={socket} />
      </div>

      {/* Voice Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto flex justify-center items-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors`}
          >
            {isMuted ? (
              <FaMicrophoneSlash className="text-white text-xl" />
            ) : (
              <FaMicrophone className="text-gray-700 text-xl" />
            )}
          </button>

          <button
            onClick={toggleDeaf}
            className={`p-4 rounded-full ${
              isDeafened ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors`}
          >
            {isDeafened ? (
              <FaHeadphonesSlash className="text-white text-xl" />
            ) : (
              <FaHeadphones className="text-gray-700 text-xl" />
            )}
          </button>

          <button
            onClick={onLeave}
            className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaSignOutAlt className="text-gray-700 text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoom;