import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoom, joinExistingRoom, leaveCurrentRoom, clearCurrentRoom } from '../store/slices/roomSlice';
import VoiceRoom from '../components/rooms/VoiceRoom';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { FaLock, FaUsers, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRoom, isLoading, error } = useSelector((state) => state.rooms);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRoom(id));
    }

    return () => {
      dispatch(clearCurrentRoom());
      if (hasJoined) {
        socketService.disconnect();
      }
    };
  }, [id, isAuthenticated, dispatch]);

  const handleJoinRoom = async () => {
    try {
      if (currentRoom?.isPrivate && !password) {
        setShowPasswordInput(true);
        return;
      }

      const result = await dispatch(joinExistingRoom({ 
        id, 
        password: currentRoom?.isPrivate ? password : null 
      })).unwrap();

      // Connect to socket
      const token = localStorage.getItem('token');
      socketService.connect(token);
      
      // Join room via socket
      socketService.emit('join-room', { roomId: id });
      
      setHasJoined(true);
      toast.success('Joined room successfully!');
    } catch (error) {
      toast.error(error || 'Failed to join room');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await dispatch(leaveCurrentRoom(id)).unwrap();
      
      // Leave room via socket
      socketService.emit('leave-room', { roomId: id });
      socketService.disconnect();
      
      setHasJoined(false);
      navigate('/rooms');
      toast.success('Left room successfully');
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <Button onClick={() => navigate('/rooms')} className="mt-4">
          <FaArrowLeft className="inline mr-2" />
          Back to Rooms
        </Button>
      </div>
    );
  }

  if (!currentRoom) {
    return null;
  }

  // If user has joined, show the voice room
  if (hasJoined) {
    return (
      <VoiceRoom
        room={currentRoom}
        socket={socketService.socket}
        onLeave={handleLeaveRoom}
      />
    );
  }

  // Show room details and join button
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/rooms')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Room Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{currentRoom.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm">
                  {currentRoom.language}
                </span>
                <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm">
                  {currentRoom.topic}
                </span>
                {currentRoom.isPrivate && (
                  <span className="flex items-center space-x-1">
                    <FaLock />
                    <span>Private Room</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="text-xl" />
              <span>{currentRoom.participants?.length || 0} / {currentRoom.maxParticipants}</span>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={currentRoom.host?.avatar || '/default-avatar.png'}
              alt={currentRoom.host?.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm text-gray-500">Hosted by</p>
              <p className="font-semibold">{currentRoom.host?.username}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              {currentRoom.description || 'No description provided'}
            </p>
          </div>

          {currentRoom.tags && currentRoom.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentRoom.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Participants Preview */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Current Participants</h3>
            <div className="flex -space-x-2">
              {currentRoom.participants?.slice(0, 5).map((participant) => (
                <img
                  key={participant.user?._id}
                  src={participant.user?.avatar || '/default-avatar.png'}
                  alt={participant.user?.username}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  title={participant.user?.username}
                />
              ))}
              {currentRoom.participants?.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{currentRoom.participants.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Join Section */}
          <div className="border-t pt-6">
            {showPasswordInput ? (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex space-x-3">
                  <Button onClick={handleJoinRoom} className="flex-1">
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
              <Button onClick={handleJoinRoom} size="lg" className="w-full">
                Join Room
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;