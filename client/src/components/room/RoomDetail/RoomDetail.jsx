import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoom, joinRoom, leaveRoom, clearError } from '../../../store/slices/roomSlice';
import Spinner from '../../ui/Spinner';
import RoomHeader from './RoomHeader';
import RoomPreview from './RoomPreview';
import ParticipantsGrid from './ParticipantsGrid';
import VoiceControls from './VoiceControls';
import RoomSidebar from './RoomSidebar';
import useVoiceChat from '../hooks/useVoiceChat';
import useRoomSocket from '../hooks/useRoomSocket';
import useParticipants from '../hooks/useParticipants';
import UploadModal from './UploadModal';
import ReportModal from './ReportModal';
import LeaveConfirmModal from './LeaveConfirmModal';
import toast from 'react-hot-toast';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { currentRoom, isLoading, error } = useSelector((state) => state.rooms);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Local state
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false); // ✅ Added loading state for join
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false); // ✅ Added leave confirmation
  const [selectedUser, setSelectedUser] = useState(null);
  const [materials, setMaterials] = useState([]);

  // Custom hooks
  const {
    isMuted,
    setIsMuted,
    isDeafened,
    setIsDeafened,
    volume,
    setVolume,
    audioEnabled,
    localStream,
    speakingUsers,
    toggleMute,
    toggleDeaf,
    handleVolumeChange,
    setupVoiceChat
  } = useVoiceChat();

  const {
    participants,
    setParticipants,
    messages,
    setMessages,
    typingUsers,
    sendMessage,
    sendTyping
  } = useRoomSocket({ roomId: id, user, hasJoined });

  const {
    handleKickUser,
    handleMuteUser,
    handleReportUser,
    handlePromoteToSpeaker,
    handleDemoteToListener
  } = useParticipants({ roomId: id, participants, setParticipants });

  // Load room data
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRoom(id));
    }
    
    // Cleanup error on unmount
    return () => {
      dispatch(clearError());
    };
  }, [id, isAuthenticated, dispatch]);

  // Update participants when room loads
  useEffect(() => {
    if (currentRoom) {
      setParticipants(currentRoom.participants || []);
    }
  }, [currentRoom, setParticipants]);

  // Check if user is already in room (for rejoining)
  useEffect(() => {
    if (currentRoom && user) {
      const isAlreadyInRoom = currentRoom.participants?.some(
        p => p.user?._id === user._id
      );
      if (isAlreadyInRoom) {
        setHasJoined(true);
      }
    }
  }, [currentRoom, user]);

  // ✅ Improved join handler with loading state and better error handling
  const handleJoinRoom = useCallback(async () => {
    try {
      if (currentRoom?.isPrivate && !password) {
        setShowPasswordInput(true);
        return;
      }

      setIsJoining(true);
      
      const result = await dispatch(joinRoom({ 
        id, 
        password: currentRoom?.isPrivate ? password : null 
      })).unwrap();
      
      await setupVoiceChat();
      
      setHasJoined(true);
      setParticipants(result.participants || []);
      toast.success('Joined room successfully!');
    } catch (error) {
      console.error('Join error:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  }, [currentRoom, password, id, dispatch, setupVoiceChat, setParticipants]);

  // ✅ Improved leave handler with confirmation
  const handleLeaveRoom = useCallback(async () => {
    try {
      await dispatch(leaveRoom(id)).unwrap();
      
      // Stop all audio tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      setHasJoined(false);
      setShowLeaveConfirm(false);
      navigate('/rooms');
      toast.success('Left room successfully');
    } catch (error) {
      console.error('Leave error:', error);
      toast.error('Failed to leave room');
    }
  }, [id, dispatch, localStream, navigate]);

  // ✅ Material sharing with proper cleanup
  const handleShareMaterial = useCallback((type, file) => {
    const material = {
      id: Date.now(),
      user: user?._id,
      username: user?.username,
      type,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      timestamp: new Date().toISOString()
    };
    setMaterials(prev => [...prev, material]);
    setShowUploadModal(false);
    toast.success('Material shared successfully!');

    // Cleanup object URL on unmount
    return () => URL.revokeObjectURL(material.url);
  }, [user]);

  const handleOpenReportModal = useCallback((user) => {
    setSelectedUser(user);
    setShowReportModal(true);
  }, []);

  const handleSubmitReport = useCallback((reason) => {
    handleReportUser(selectedUser?._id, reason);
    setShowReportModal(false);
    setSelectedUser(null);
  }, [handleReportUser, selectedUser]);

  // Role checks
  const isHost = currentRoom?.host?._id === user?._id;
  const isModerator = currentRoom?.moderators?.includes(user?._id) || isHost;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
        <Spinner size="lg" />
        <p className="text-gray-400 mt-4 animate-pulse">Loading room...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
        <div className="bg-red-500/10 rounded-full p-4 mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={() => navigate('/rooms')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition"
        >
          ← Back to Rooms
        </button>
      </div>
    );
  }

  // Room not found
  if (!currentRoom) {
    return null;
  }

  // Preview mode (not joined yet)
  if (!hasJoined) {
    return (
      <RoomPreview
        room={currentRoom}
        showPasswordInput={showPasswordInput}
        password={password}
        setPassword={setPassword}
        onJoin={handleJoinRoom}
        onBack={() => navigate('/rooms')}
        isAuthenticated={isAuthenticated}
        isJoining={isJoining} // ✅ Pass loading state
      />
    );
  }

  // Main room interface
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <RoomHeader
        room={currentRoom}
        participantCount={participants.length}
        onLeave={() => setShowLeaveConfirm(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area - Participants Grid */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
          <ParticipantsGrid
            participants={participants}
            speakingUsers={speakingUsers}
            currentUser={user}
            isHost={isHost}
            isModerator={isModerator}
            onReport={handleOpenReportModal}
            onKick={handleKickUser}
            onMute={handleMuteUser}
            onPromote={handlePromoteToSpeaker}
            onDemote={handleDemoteToListener}
          />
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          <RoomSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            participants={participants}
            messages={messages}
            typingUsers={typingUsers}
            materials={materials}
            currentUser={user}
            onSendMessage={sendMessage}
            onSendTyping={sendTyping}
            onUploadClick={() => setShowUploadModal(true)}
            isHost={isHost}
            isModerator={isModerator}
            onReport={handleOpenReportModal}
            onKick={handleKickUser}
            onMute={handleMuteUser}
          />
        )}
      </div>

      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        volume={volume}
        audioEnabled={audioEnabled}
        participantsCount={participants.length}
        onToggleMute={toggleMute}
        onToggleDeaf={toggleDeaf}
        onVolumeChange={handleVolumeChange}
      />

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleShareMaterial}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmitReport}
        user={selectedUser}
      />

      <LeaveConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveRoom}
        roomName={currentRoom.name}
      />
    </div>
  );
};

export default RoomDetail;