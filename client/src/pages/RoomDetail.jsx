import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaMicrophone, FaMicrophoneSlash, FaHeadphones, FaVolumeUp,
  FaVolumeMute, FaSignOutAlt, FaUsers, FaComments, FaFile,
  FaFlag, FaShare, FaChevronLeft, FaChevronRight, FaVolumeDown,
  FaVolumeOff, FaRegSmile, FaPaperPlane, FaBan, FaPlus,
  FaShieldAlt, FaCrown, FaEllipsisV, FaTimes, FaLock, FaGlobe,
  FaHashtag, FaUpload
} from 'react-icons/fa';
import { fetchRoom, joinRoom, leaveRoom } from '../store/slices/roomSlice';
import { addToast } from '../store/slices/uiSlice';
import toast from 'react-hot-toast';

/* ─── Tiny reusable primitives (no UI lib) ─── */

const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className={`${s} border-2 border-violet-500 border-t-transparent rounded-full animate-spin`} />
  );
};

const Avatar = ({ src, alt = '', size = 'md', speaking = false, className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const initials = alt.slice(0, 2).toUpperCase() || '??';
  const colors = ['bg-violet-600', 'bg-fuchsia-600', 'bg-sky-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600'];
  const color = colors[alt.charCodeAt(0) % colors.length] || 'bg-violet-600';
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white ${speaking ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''} ${src ? '' : color} overflow-hidden`}>
        {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : initials}
      </div>
      {speaking && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-900" />}
    </div>
  );
};

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    primary: 'bg-violet-600/20 text-violet-300 border border-violet-500/30',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    secondary: 'bg-gray-600/40 text-gray-300 border border-gray-500/30',
  };
  const sizes = { sm: 'text-xs px-1.5 py-0.5', md: 'text-xs px-2.5 py-1' };
  return <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>{children}</span>;
};

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && content && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-gray-200 text-xs rounded-md whitespace-nowrap z-50 border border-gray-700 shadow-xl pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-950" />
        </div>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/60">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
            <FaTimes size={14} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ─── Main RoomDetail ─── */

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRoom, isLoading, error } = useSelector((state) => state.rooms);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [hasJoined, setHasJoined] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());

  const [materials, setMaterials] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const localStreamRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchRoom(id));
  }, [id, isAuthenticated, dispatch]);

  useEffect(() => {
    if (currentRoom) setParticipants(currentRoom.participants || []);
  }, [currentRoom]);

  const handleJoinRoom = async () => {
    try {
      if (currentRoom?.isPrivate && !password) { setShowPasswordInput(true); return; }
      const result = await dispatch(joinRoom({ id, password: currentRoom?.isPrivate ? password : null })).unwrap();
      await setupVoiceChat();
      setHasJoined(true);
      setParticipants(result.participants || []);
      toast.success('Joined successfully!');
    } catch (err) { toast.error(err || 'Failed to join room'); }
  };

  const setupVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach(t => { t.enabled = false; });
      setAudioEnabled(true);
    } catch { toast.error('Microphone access required to speak'); }
  };

  const handleLeaveRoom = async () => {
    try {
      await dispatch(leaveRoom(id)).unwrap();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      setHasJoined(false);
      navigate('/rooms');
      toast.success('Left room');
    } catch { toast.error('Failed to leave room'); }
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(v => !v);
  };

  const toggleDeaf = () => {
    setIsDeafened(v => !v);
    document.querySelectorAll('audio').forEach(a => { a.muted = !isDeafened; });
  };

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    document.querySelectorAll('audio').forEach(a => { a.volume = v / 100; });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: { _id: user?._id, username: user?.username, avatar: user?.avatar },
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }]);
    setNewMessage('');
  };

  const handleShareMaterial = (file) => {
    setMaterials(prev => [...prev, {
      id: Date.now(), user: user?._id, username: user?.username,
      name: file.name, size: file.size, url: URL.createObjectURL(file),
      timestamp: new Date().toISOString(),
      ext: file.name.split('.').pop().toLowerCase(),
    }]);
    setShowUploadModal(false);
    toast.success('Material shared!');
  };

  const handleReportUser = () => {
    if (!reportReason.trim()) return;
    toast.success('Report submitted to moderators');
    setShowReportModal(false);
    setReportReason('');
    setSelectedUser(null);
  };

  const handleKickUser = (userId) => {
    setParticipants(prev => prev.filter(p => p.user?._id !== userId));
    toast.success('User removed from room');
  };

  const handleMuteUser = (userId) => {
    setParticipants(prev => prev.map(p => p.user?._id === userId ? { ...p, isMuted: !p.isMuted } : p));
    toast.success('User mute toggled');
  };

  const isHost = currentRoom?.host?._id === user?._id;
  const isModerator = currentRoom?.moderators?.includes(user?._id) || isHost;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm animate-pulse">Loading room...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <FaTimes className="text-red-400" />
      </div>
      <p className="text-red-400">{error}</p>
      <button onClick={() => navigate('/rooms')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition">
        ← Back to Rooms
      </button>
    </div>
  );

  if (!currentRoom) return null;

  if (!hasJoined) return (
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

  const VolumeIcon = volume === 0 ? FaVolumeOff : volume < 50 ? FaVolumeDown : FaVolumeUp;

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/60 shadow-2xl">

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900/80 border-b border-gray-800/60 backdrop-blur-sm gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(v => !v)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition flex-shrink-0"
            >
              {isSidebarOpen ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-white truncate">{currentRoom.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="primary" size="sm">{currentRoom.language}</Badge>
                <Badge variant="secondary" size="sm">{currentRoom.topic}</Badge>
                {currentRoom.isPrivate
                  ? <span className="text-xs text-amber-400 flex items-center gap-1"><FaLock size={9} /> Private</span>
                  : <span className="text-xs text-gray-500 flex items-center gap-1"><FaGlobe size={9} /> Public</span>
                }
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tooltip content="Share invite link">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                <FaShare size={15} />
              </button>
            </Tooltip>
            <Tooltip content="Report room">
              <button className="p-2 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition">
                <FaFlag size={15} />
              </button>
            </Tooltip>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 rounded-xl text-sm font-medium transition"
            >
              <FaSignOutAlt size={13} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <ParticipantsGrid
            participants={participants}
            speakingUsers={speakingUsers}
            currentUser={user}
            isHost={isHost}
            isModerator={isModerator}
            onReport={(u) => { setSelectedUser(u); setShowReportModal(true); }}
            onKick={handleKickUser}
            onMute={handleMuteUser}
          />
        </div>

        {/* Voice Controls Bar */}
        <div className="bg-gray-900/80 border-t border-gray-800/60 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Tooltip content={isMuted ? 'Unmute mic' : 'Mute mic'}>
                <button
                  onClick={toggleMute}
                  disabled={!audioEnabled}
                  className={`p-3 rounded-xl transition-all duration-150 ${
                    !audioEnabled ? 'opacity-40 cursor-not-allowed bg-gray-800 text-gray-500' :
                    isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105' :
                    'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {isMuted ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
                </button>
              </Tooltip>

              <Tooltip content={isDeafened ? 'Undeafen' : 'Deafen all audio'}>
                <button
                  onClick={toggleDeaf}
                  className={`p-3 rounded-xl transition-all duration-150 ${
                    isDeafened ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105' :
                    'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {isDeafened ? <FaVolumeMute size={18} /> : <FaHeadphones size={18} />}
                </button>
              </Tooltip>

              {/* Volume */}
              <div className="relative">
                <Tooltip content="Volume">
                  <button
                    onClick={() => setShowVolumeSlider(v => !v)}
                    className="p-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition"
                  >
                    <VolumeIcon size={18} />
                  </button>
                </Tooltip>
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-0 mb-3 bg-gray-800 border border-gray-700/60 rounded-xl p-4 shadow-2xl z-20 w-40">
                    <input
                      type="range" min="0" max="100" value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 rounded-full appearance-none bg-gray-600 accent-violet-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>0%</span>
                      <span className="text-violet-400 font-medium">{volume}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 pl-1">
                <FaUsers size={13} />
                <span><span className="text-white font-semibold">{participants.length}</span> in room</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Audio status pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                audioEnabled
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${audioEnabled ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                {audioEnabled ? 'Connected' : 'No Audio'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      {isSidebarOpen && (
        <RoomSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          participants={participants}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          typingUsers={typingUsers}
          materials={materials}
          onUploadClick={() => setShowUploadModal(true)}
          currentUser={user}
          isHost={isHost}
          isModerator={isModerator}
          onReport={(u) => { setSelectedUser(u); setShowReportModal(true); }}
          onKick={handleKickUser}
          onMute={handleMuteUser}
        />
      )}

      {/* ── Modals ── */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={handleShareMaterial} />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => { setShowReportModal(false); setSelectedUser(null); setReportReason(''); }}
        onSubmit={handleReportUser}
        reason={reportReason}
        setReason={setReportReason}
        user={selectedUser}
      />

      {/* Leave Confirmation */}
      <Modal isOpen={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)} title="Leave Room?">
        <p className="text-gray-400 mb-6 text-sm">Are you sure you want to leave <span className="text-white font-medium">{currentRoom.name}</span>?</p>
        <div className="flex gap-3">
          <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition">
            Stay
          </button>
          <button onClick={handleLeaveRoom} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition">
            Leave Room
          </button>
        </div>
      </Modal>
    </div>
  );
};

/* ─── Room Preview ─── */

const RoomPreview = ({ room, showPasswordInput, password, setPassword, onJoin, onBack, isAuthenticated }) => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition group">
      <FaChevronLeft className="group-hover:-translate-x-0.5 transition-transform" size={12} />
      Back to Rooms
    </button>

    {/* Hero Card */}
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/60 shadow-2xl">
      {/* Gradient Banner */}
      <div className="h-32 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -top-4 left-12 w-20 h-20 rounded-full bg-white/5 blur-xl" />
        <div className="absolute inset-0 flex items-center px-6 gap-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <FaHashtag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {room.isPrivate
                ? <span className="flex items-center gap-1 text-amber-300 text-xs"><FaLock size={9} />Private</span>
                : <span className="flex items-center gap-1 text-green-300 text-xs"><FaGlobe size={9} />Public</span>
              }
              <span className="text-white/60 text-xs">{room.participants?.length || 0}/{room.maxParticipants} members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-1">
        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant="primary">{room.language}</Badge>
          <Badge variant="secondary">{room.topic}</Badge>
          {room.tags?.map((t, i) => <Badge key={i} variant="default">#{t}</Badge>)}
        </div>

        {/* Host */}
        <div className="flex items-center gap-3 mb-5 p-3.5 bg-gray-800/60 rounded-xl border border-gray-700/40">
          <Avatar src={room.host?.avatar} alt={room.host?.username} size="md" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Room Host</p>
            <p className="text-white font-semibold flex items-center gap-1.5">
              <FaCrown className="text-amber-400" size={12} />
              {room.host?.username}
            </p>
          </div>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-gray-400 text-sm leading-relaxed mb-5">{room.description}</p>
        )}

        {/* Participants preview */}
        {room.participants?.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {room.participants.slice(0, 5).map((p, i) => (
                <Avatar key={i} src={p.user?.avatar} alt={p.user?.username || ''} size="sm"
                  className="ring-2 ring-gray-900" />
              ))}
              {room.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 ring-2 ring-gray-900 flex items-center justify-center text-xs text-gray-300 font-medium">
                  +{room.participants.length - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">{room.participants.length} people inside</span>
          </div>
        )}

        {/* Join Action */}
        <div className="border-t border-gray-800/60 pt-5">
          {!isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">Sign in to join this room</p>
              <Link to="/login" className="block w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-center transition">
                Sign In to Join
              </Link>
            </div>
          ) : showPasswordInput ? (
            <div className="space-y-3">
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                <input
                  type="password"
                  placeholder="Room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onJoin()}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-2.5">
                <button onClick={onJoin} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition text-sm">
                  Join Room
                </button>
                <button onClick={() => setPassword('')} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={onJoin} className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
              <FaHeadphones size={16} />
              Join Room
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Participants Grid ─── */

const ParticipantsGrid = ({ participants, speakingUsers, currentUser, isHost, isModerator, onReport, onKick, onMute }) => {
  if (participants.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
      <FaUsers size={40} className="opacity-30" />
      <p className="text-sm">No participants yet</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {participants.map((p) => {
        const isSpeaking = speakingUsers.has(p.user?._id);
        const isCurrentUser = p.user?._id === currentUser?._id;
        const isRoomHost = p.role === 'host';

        return (
          <div
            key={p.user?._id}
            className={`relative group rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
              isSpeaking
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-gray-800/60 border border-gray-700/30 hover:bg-gray-800 hover:border-gray-600/60'
            }`}
          >
            {/* Role badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {isRoomHost && <Tooltip content="Host"><span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"><FaCrown size={9} className="text-white" /></span></Tooltip>}
              {p.role === 'moderator' && !isRoomHost && <Tooltip content="Moderator"><span className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"><FaShieldAlt size={9} className="text-white" /></span></Tooltip>}
            </div>

            <Avatar src={p.user?.avatar} alt={p.user?.username || ''} size="lg" speaking={isSpeaking} />

            {/* Mute icon overlay */}
            {p.isMuted && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <FaMicrophoneSlash size={9} className="text-white" />
              </div>
            )}

            <div className="text-center w-full">
              <p className="text-white text-xs font-semibold truncate">
                {p.user?.username}{isCurrentUser ? ' (You)' : ''}
              </p>
              <p className="text-gray-500 text-xs capitalize">{p.role || 'listener'}</p>
            </div>

            {/* Moderation hover overlay */}
            {(isModerator || isHost) && !isCurrentUser && (
              <div className="absolute inset-0 bg-gray-950/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <Tooltip content={p.isMuted ? 'Unmute' : 'Mute'}>
                  <button onClick={() => onMute(p.user?._id)}
                    className="p-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 rounded-xl transition">
                    <FaMicrophoneSlash size={13} />
                  </button>
                </Tooltip>
                <Tooltip content="Kick">
                  <button onClick={() => onKick(p.user?._id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition">
                    <FaBan size={13} />
                  </button>
                </Tooltip>
                <Tooltip content="Report">
                  <button onClick={() => onReport(p.user)}
                    className="p-2 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded-xl transition">
                    <FaFlag size={13} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Sidebar ─── */

const RoomSidebar = ({
  activeTab, setActiveTab, participants, messages, newMessage, setNewMessage,
  onSendMessage, typingUsers, materials, onUploadClick, currentUser,
  isHost, isModerator, onReport, onKick, onMute
}) => (
  <div className="w-72 xl:w-80 bg-gray-900 border-l border-gray-800/60 flex flex-col flex-shrink-0">
    {/* Tab Bar */}
    <div className="flex border-b border-gray-800/60">
      {[
        { key: 'chat', icon: FaComments, label: 'Chat', count: messages.length },
        { key: 'participants', icon: FaUsers, label: 'People', count: participants.length },
        { key: 'materials', icon: FaFile, label: 'Files', count: materials.length },
      ].map(({ key, icon: Icon, label, count }) => (
        <button key={key} onClick={() => setActiveTab(key)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition border-b-2 ${
            activeTab === key
              ? 'text-violet-400 border-violet-500 bg-violet-500/5'
              : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/40'
          }`}>
          <Icon size={15} />
          <span>{label}{count > 0 ? ` (${count})` : ''}</span>
        </button>
      ))}
    </div>

    {/* Content */}
    <div className="flex-1 overflow-hidden">
      {activeTab === 'chat' && (
        <ChatTab messages={messages} newMessage={newMessage} setNewMessage={setNewMessage}
          onSendMessage={onSendMessage} typingUsers={typingUsers} currentUser={currentUser} />
      )}
      {activeTab === 'participants' && (
        <ParticipantsTab participants={participants} currentUser={currentUser}
          isHost={isHost} isModerator={isModerator} onReport={onReport} onKick={onKick} onMute={onMute} />
      )}
      {activeTab === 'materials' && (
        <MaterialsTab materials={materials} onUploadClick={onUploadClick} />
      )}
    </div>
  </div>
);

/* ─── Chat Tab ─── */

const ChatTab = ({ messages, newMessage, setNewMessage, onSendMessage, typingUsers, currentUser }) => {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 py-12">
            <FaComments size={32} className="opacity-30" />
            <p className="text-xs">No messages yet. Say hi! 👋</p>
          </div>
        )}
        {messages.map(m => <ChatMessage key={m.id} message={m} currentUser={currentUser} />)}
        {typingUsers.size > 0 && <TypingIndicator users={Array.from(typingUsers)} />}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-gray-800/60">
        <form onSubmit={onSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/60 border border-gray-700/60 focus:border-violet-500/40 placeholder-gray-600 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition flex-shrink-0"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

const ChatMessage = ({ message, currentUser }) => {
  const isOwn = message.user?._id === currentUser?._id;
  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && <Avatar src={message.user?.avatar} alt={message.user?.username || ''} size="xs" className="flex-shrink-0 mt-0.5" />}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isOwn && <span className="text-xs text-gray-400 px-1">{message.user?.username}</span>}
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-violet-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/40'
        }`}>
          {message.content}
        </div>
        <span className="text-xs text-gray-600 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const TypingIndicator = ({ users }) => (
  <div className="flex items-center gap-2 text-gray-500 text-xs pl-1">
    <div className="flex gap-0.5">
      {[0, 150, 300].map(d => (
        <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
    <span>{users.length === 1 ? `${users[0]} is typing…` : `${users.length} people typing…`}</span>
  </div>
);

/* ─── Participants Tab ─── */

const ParticipantsTab = ({ participants, currentUser, isHost, isModerator, onReport, onKick, onMute }) => (
  <div className="h-full overflow-y-auto p-3 space-y-1">
    {participants.map(p => {
      const isCurrentUser = p.user?._id === currentUser?._id;
      return (
        <div key={p.user?._id}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-800/60 group transition">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={p.user?.avatar} alt={p.user?.username || ''} size="sm" />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {p.user?.username}{isCurrentUser ? ' (You)' : ''}
              </p>
              <div className="flex items-center gap-1.5">
                {p.role === 'host' && <FaCrown size={9} className="text-amber-400" />}
                {p.role === 'moderator' && <FaShieldAlt size={9} className="text-violet-400" />}
                <span className="text-xs text-gray-500 capitalize">{p.role || 'listener'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            {p.isMuted && <FaMicrophoneSlash size={11} className="text-red-400 mr-1" />}
            {(isModerator || isHost) && !isCurrentUser && (
              <>
                <button onClick={() => onMute(p.user?._id)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition">
                  <FaMicrophoneSlash size={11} />
                </button>
                <button onClick={() => onKick(p.user?._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition">
                  <FaBan size={11} />
                </button>
                <button onClick={() => onReport(p.user)} className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-gray-700 rounded-lg transition">
                  <FaFlag size={11} />
                </button>
              </>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Materials Tab ─── */

const extIcon = (ext) => {
  const map = { pdf: '📄', doc: '📝', docx: '📝', png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼', mp3: '🎵', mp4: '🎬', zip: '🗜', js: '💻', ts: '💻', py: '💻' };
  return map[ext] || '📁';
};

const MaterialsTab = ({ materials, onUploadClick }) => (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-gray-800/60">
      <button
        onClick={onUploadClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-400/40 rounded-xl text-sm font-medium transition"
      >
        <FaUpload size={13} />
        Share a File
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {materials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-600 gap-2">
          <FaFile size={28} className="opacity-30" />
          <p className="text-xs">No files shared yet</p>
        </div>
      )}
      {materials.map(m => (
        <a key={m.id} href={m.url} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/30 hover:border-gray-600/60 rounded-xl cursor-pointer transition group">
          <span className="text-2xl flex-shrink-0">{extIcon(m.ext)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate group-hover:text-violet-300 transition">{m.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {m.username} · {m.size < 1024 ? `${m.size}B` : m.size < 1024 * 1024 ? `${(m.size / 1024).toFixed(1)}KB` : `${(m.size / 1024 / 1024).toFixed(1)}MB`}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
);

/* ─── Upload Modal ─── */

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = () => {
    if (file) { onUpload(file); setFile(null); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share a File">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-violet-500 bg-violet-500/10' :
          file ? 'border-green-500/40 bg-green-500/5 cursor-default' :
          'border-gray-700 hover:border-gray-500 hover:bg-gray-800/40'
        }`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">{extIcon(file.name.split('.').pop().toLowerCase())}</span>
            <p className="text-white font-medium text-sm">{file.name}</p>
            <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-xs text-gray-500 hover:text-red-400 transition mt-1">
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <FaUpload size={28} className="opacity-50" />
            <p className="text-sm font-medium text-gray-400">Drop file here or click to browse</p>
            <p className="text-xs">Images, PDFs, docs, code files…</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition">
          Cancel
        </button>
        <button onClick={handleUpload} disabled={!file}
          className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition">
          Share File
        </button>
      </div>
    </Modal>
  );
};

/* ─── Report Modal ─── */

const ReportModal = ({ isOpen, onClose, onSubmit, reason, setReason, user }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Report User">
    {user && (
      <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/40 mb-4">
        <Avatar src={user.avatar} alt={user.username || ''} size="sm" />
        <div>
          <p className="text-white text-sm font-medium">{user.username}</p>
          <p className="text-gray-500 text-xs">Reporting this user to moderators</p>
        </div>
      </div>
    )}

    <div className="mb-5">
      {/* Quick reason buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['Harassment', 'Spam', 'Inappropriate behavior', 'Hate speech', 'Off-topic'].map(r => (
          <button key={r} onClick={() => setReason(r)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              reason === r
                ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700/60 hover:border-gray-500'
            }`}>
            {r}
          </button>
        ))}
      </div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700/60 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition resize-none"
        placeholder="Add more details (optional)…"
      />
    </div>

    <div className="flex gap-3">
      <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition">
        Cancel
      </button>
      <button onClick={onSubmit} disabled={!reason.trim()}
        className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition">
        Submit Report
      </button>
    </div>
  </Modal>
);

export default RoomDetail;