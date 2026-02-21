import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoom, joinRoom, leaveRoom } from '../../../store/slices/roomSlice';
import { addToast } from '../../../store/slices/uiSlice';
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
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'participants', 'materials'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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
  }, [id, isAuthenticated, dispatch]);

  // Update participants when room loads
  useEffect(() => {
    if (currentRoom) {
      setParticipants(currentRoom.participants || []);
    }
  }, [currentRoom, setParticipants]);

  const handleJoinRoom = async () => {
    try {
      if (currentRoom?.isPrivate && !password) {
        setShowPasswordInput(true);
        return;
      }

      const result = await dispatch(joinRoom({ 
        id, 
        password: currentRoom?.isPrivate ? password : null 
      })).unwrap();
      
      await setupVoiceChat();
      
      setHasJoined(true);
      setParticipants(result.participants || []);
      toast.success('Joined room successfully!');
    } catch (error) {
      toast.error(error || 'Failed to join room');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await dispatch(leaveRoom(id)).unwrap();
      
      // Stop all audio tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      setHasJoined(false);
      navigate('/rooms');
      toast.success('Left room successfully');
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  const handleShareMaterial = (type, file) => {
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
  };

  const handleOpenReportModal = (user) => {
    setSelectedUser(user);
    setShowReportModal(true);
  };

  const handleSubmitReport = (reason) => {
    handleReportUser(selectedUser?._id, reason);
    setShowReportModal(false);
    setSelectedUser(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button 
          onClick={() => navigate('/rooms')}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Rooms
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
      />
    );
  }

  // Main room interface
  return (
    <div className="h-[calc(100vh-5rem)] flex bg-gray-900 rounded-xl overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <RoomHeader
          room={currentRoom}
          participantsCount={participants.length}
          onLeave={handleLeaveRoom}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <ParticipantsGrid
          participants={participants}
          speakingUsers={speakingUsers}
          currentUser={user}
          isHost={currentRoom.host?._id === user?._id}
          isModerator={currentRoom.moderators?.includes(user?._id)}
          onReport={handleOpenReportModal}
          onKick={handleKickUser}
          onMute={handleMuteUser}
          onPromote={handlePromoteToSpeaker}
          onDemote={handleDemoteToListener}
        />

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
        />
      )}

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
    </div>
  );
};

export default RoomDetail;