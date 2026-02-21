import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHeadphones, 
  FaVolumeUp,
  FaVolumeMute,
  FaSignOutAlt,
  FaUsers,
  FaComments,
  FaUserPlus,
  FaShieldAlt,
  FaGavel,
  FaBan,
  FaStar,
  FaFlag,
  FaShare,
  FaLink,
  FaCopy,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaVolumeDown,
  FaVolumeOff,
  FaRegSmile,
  FaPaperPlane,
  FaImage,
  FaFile,
  FaCode,
  FaBold,
  FaItalic,
  FaUnderline,
  FaList,
  FaLink as FaLinkIcon,
  FaPlus,
  FaTimes,
  FaCog,
  FaExpand,
  FaCompress,
  FaBookmark,
  FaHeart,
  FaComment,
  FaEllipsisV,
  FaPhone,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaStop,
  FaPlay,
  FaPause,
  FaClosedCaptioning,
  FaLanguage,
  FaKeyboard,
  FaLightbulb,
  FaQuestionCircle,
  FaGraduationCap,
  FaTrophy,
  FaMedal,
  FaFire,
  FaClock,
  FaCalendar,
  FaDownload,
  FaUpload,
  FaPoll,
  FaHandPaper,
  FaThumbsUp,
  FaEye,
  FaChalkboardTeacher,
  FaBookOpen,
  FaPen,
  FaMagic,
  FaRocket,
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { fetchRoom, joinRoom, leaveRoom } from '../store/slices/roomSlice';
import { addToast } from '../store/slices/uiSlice';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Tooltip from '../components/ui/Tooltip';
import toast from 'react-hot-toast';

const EnhancedRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRoom, isLoading, error } = useSelector((state) => state.rooms);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Room state
  const [hasJoined, setHasJoined] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Voice/Video chat states
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'speaker', 'gallery'
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [chatFilter, setChatFilter] = useState('all'); // 'all', 'mentions', 'starred'
  
  // Material/Learning states
  const [materials, setMaterials] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);
  const [showVocabModal, setShowVocabModal] = useState(false);
  
  // Interactive features
  const [polls, setPolls] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [transcription, setTranscription] = useState([]);
  const [showTranscription, setShowTranscription] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  
  // Gamification states
  const [userPoints, setUserPoints] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Session states
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionGoals, setSessionGoals] = useState([]);
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [showPronunciationFeedback, setShowPronunciationFeedback] = useState(false);
  
  // Moderation states
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Collaboration states
  const [whiteboard, setWhiteboard] = useState(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [sharedNotes, setSharedNotes] = useState('');
  const [showSharedNotes, setShowSharedNotes] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState([]);
  
  // Refs
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnections = useRef({});
  const sessionTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRoom(id));
    }
  }, [id, isAuthenticated, dispatch]);

  useEffect(() => {
    if (currentRoom) {
      setParticipants(currentRoom.participants || []);
      // Initialize room-specific data
      initializeRoomData();
    }
  }, [currentRoom]);

  // Session timer
  useEffect(() => {
    if (hasJoined) {
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    }
  }, [hasJoined]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      return () => {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };
    } else {
      setRecordingDuration(0);
    }
  }, [isRecording]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeRoomData = () => {
    // Initialize sample data - replace with actual API calls
    setFlashcards([
      { id: 1, front: 'Hello', back: 'Hola', language: 'Spanish', mastered: false },
      { id: 2, front: 'Goodbye', back: 'Adiós', language: 'Spanish', mastered: false },
      { id: 3, front: 'Thank you', back: 'Gracias', language: 'Spanish', mastered: false },
    ]);

    setVocabulary([
      { id: 1, word: 'Bonjour', translation: 'Hello', language: 'French', example: 'Bonjour, comment allez-vous?', learned: true },
      { id: 2, word: 'Merci', translation: 'Thank you', language: 'French', example: 'Merci beaucoup!', learned: false },
    ]);

    setSessionGoals([
      { id: 1, text: 'Practice 20 minutes of conversation', completed: false, points: 50 },
      { id: 2, text: 'Learn 5 new vocabulary words', completed: false, points: 30 },
      { id: 3, text: 'Complete a pronunciation exercise', completed: false, points: 40 },
    ]);

    setLeaderboard([
      { rank: 1, user: 'Sarah', points: 2450, streak: 15 },
      { rank: 2, user: 'Mike', points: 2180, streak: 12 },
      { rank: 3, user: 'Emma', points: 1920, streak: 8 },
    ]);
  };

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
      
      await setupMediaStreams();
      
      setHasJoined(true);
      setParticipants(result.participants || []);
      toast.success('🎉 Welcome to the room!');
      
      // Award points for joining
      awardPoints(10, 'Joined room');
    } catch (error) {
      toast.error(error || 'Failed to join room');
    }
  };

  const setupMediaStreams = async () => {
    try {
      // Audio stream
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = audioStream;
      
      // Mute initially
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });

      setAudioEnabled(true);
      toast.success('🎤 Microphone ready');
    } catch (error) {
      console.error('Failed to get media access:', error);
      toast.error('Please allow microphone access');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await dispatch(leaveRoom(id)).unwrap();
      
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setHasJoined(false);
      navigate('/rooms');
      toast.success('👋 Left room successfully');
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      toast.success(isMuted ? '🎤 Microphone unmuted' : '🔇 Microphone muted');
    }
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoEnabled) {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
        }
        setIsVideoEnabled(true);
        toast.success('📹 Camera enabled');
      } else {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          localVideoRef.current.srcObject = null;
        }
        setIsVideoEnabled(false);
        toast.success('📹 Camera disabled');
      }
    } catch (error) {
      toast.error('Failed to access camera');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        toast.success('🖥️ Screen sharing started');
        awardPoints(20, 'Started screen share');
      } else {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
        toast.success('🖥️ Screen sharing stopped');
      }
    } catch (error) {
      toast.error('Failed to share screen');
    }
  };

  const toggleDeaf = () => {
    setIsDeafened(!isDeafened);
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = !isDeafened;
    });
    toast.success(isDeafened ? '🔊 Sound unmuted' : '🔇 Sound muted');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume / 100;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: {
        _id: user?._id,
        username: user?.username,
        avatar: user?.avatar
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      replyTo: replyingTo,
      reactions: {}
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);
    
    // Award points for participation
    awardPoints(5, 'Sent message');
    
    // Auto-translate if enabled
    if (autoTranslate && targetLanguage !== currentRoom?.language) {
      handleAutoTranslate(message);
    }
  };

  const handleAutoTranslate = async (message) => {
    // Implement translation API call
    // For now, just a placeholder
    console.log('Translating:', message.content, 'to', targetLanguage);
  };

  const handleTyping = () => {
    // Emit typing indicator to other users
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 2000);
  };

  const handleReactToMessage = (messageId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [emoji]: (prev[messageId]?.[emoji] || 0) + 1
      }
    }));
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
      timestamp: new Date().toISOString(),
      downloads: 0,
      likes: 0
    };
    setMaterials(prev => [...prev, material]);
    setShowUploadModal(false);
    toast.success('📚 Material shared successfully!');
    awardPoints(15, 'Shared learning material');
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    if (!isHandRaised) {
      setRaisedHands(prev => new Set([...prev, user?._id]));
      toast.success('✋ Hand raised');
    } else {
      setRaisedHands(prev => {
        const newSet = new Set(prev);
        newSet.delete(user?._id);
        return newSet;
      });
      toast.success('Hand lowered');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    toast.success('🔴 Recording started');
    // Implement actual recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    const recording = {
      id: Date.now(),
      duration: recordingDuration,
      timestamp: new Date().toISOString(),
      url: '#' // Replace with actual recording URL
    };
    setRecordings(prev => [...prev, recording]);
    toast.success('✅ Recording saved');
    awardPoints(25, 'Saved recording');
  };

  const awardPoints = (points, reason) => {
    setUserPoints(prev => prev + points);
    toast.success(`+${points} points: ${reason}`, { icon: '⭐' });
    
    // Check for achievements
    checkAchievements(userPoints + points);
  };

  const checkAchievements = (totalPoints) => {
    const newAchievements = [];
    
    if (totalPoints >= 100 && !achievements.some(a => a.id === 'first_100')) {
      newAchievements.push({ id: 'first_100', name: 'Century Club', icon: '💯' });
    }
    if (sessionDuration >= 1200 && !achievements.some(a => a.id === 'twenty_minutes')) {
      newAchievements.push({ id: 'twenty_minutes', name: 'Committed Learner', icon: '⏰' });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(ach => {
        toast.success(`🏆 Achievement Unlocked: ${ach.name}!`);
      });
    }
  };

  const createPoll = (question, options) => {
    const poll = {
      id: Date.now(),
      question,
      options: options.map(opt => ({ text: opt, votes: 0, voters: [] })),
      createdBy: user?.username,
      timestamp: new Date().toISOString(),
      active: true
    };
    setPolls(prev => [...prev, poll]);
    setCurrentPoll(poll);
    toast.success('📊 Poll created');
  };

  const votePoll = (pollId, optionIndex) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const newOptions = [...poll.options];
        if (!newOptions[optionIndex].voters.includes(user?._id)) {
          newOptions[optionIndex].votes += 1;
          newOptions[optionIndex].voters.push(user?._id);
        }
        return { ...poll, options: newOptions };
      }
      return poll;
    }));
    awardPoints(5, 'Voted in poll');
  };

  const handleReportUser = () => {
    if (!reportReason.trim()) return;
    
    toast.success('Report submitted to moderators');
    setShowReportModal(false);
    setReportReason('');
    setSelectedUser(null);
  };

  const handleKickUser = (userId) => {
    if (window.confirm('Are you sure you want to kick this user?')) {
      toast.success('User kicked from room');
      setParticipants(prev => prev.filter(p => p.user?._id !== userId));
    }
  };

  const handleMuteUser = (userId) => {
    toast.success('User muted');
    setParticipants(prev => prev.map(p => 
      p.user?._id === userId ? { ...p, isMuted: true } : p
    ));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isHost = currentRoom?.host?._id === user?._id;
  const isModerator = currentRoom?.moderators?.includes(user?._id) || isHost;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4 text-lg animate-pulse">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-red-300 text-lg mb-6">{error}</p>
          <Button onClick={() => navigate('/rooms')} className="bg-white text-purple-900 hover:bg-gray-100">
            <FaChevronLeft className="mr-2" />
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return null;
  }

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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Custom Header with Glassmorphism */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
            >
              {isSidebarOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <FaLanguage className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{currentRoom.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge variant="primary" size="sm" className="bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    {currentRoom.language}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="bg-pink-500/30 text-pink-200 border border-pink-400/30">
                    {currentRoom.topic}
                  </Badge>
                  <span className="text-sm text-white/60 flex items-center">
                    <FaChalkboardTeacher className="mr-1" />
                    {currentRoom.host?.username}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Session Stats */}
            <div className="hidden md:flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="flex items-center space-x-2">
                <FaClock className="text-blue-400" />
                <span className="text-white font-mono">{formatDuration(sessionDuration)}</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-400" />
                <span className="text-white font-bold">{userPoints}</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <FaFire className="text-orange-400" />
                <span className="text-white font-bold">{userStreak}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Tooltip content="Leaderboard">
                <button 
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <FaTrophy size={18} />
                </button>
              </Tooltip>
              
              <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <button 
                  onClick={toggleFullscreen}
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  {isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
              </Tooltip>
              
              <Tooltip content="Settings">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <FaCog size={18} />
                </button>
              </Tooltip>

              <Button
                variant="danger"
                size="sm"
                onClick={handleLeaveRoom}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30"
              >
                <FaSignOutAlt />
                <span>Leave</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Learning Tools */}
        <div className="hidden xl:flex w-72 bg-black/20 backdrop-blur-xl border-r border-white/10 flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-lg mb-3 flex items-center">
              <FaGraduationCap className="mr-2 text-purple-400" />
              Learning Tools
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Session Goals */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <FaBullseye className="mr-2 text-green-400" />
                Today's Goals
              </h3>
              <div className="space-y-2">
                {sessionGoals.map(goal => (
                  <div key={goal.id} className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => {
                        setSessionGoals(prev => prev.map(g =>
                          g.id === goal.id ? { ...g, completed: !g.completed } : g
                        ));
                        if (!goal.completed) awardPoints(goal.points, goal.text);
                      }}
                      className="mt-1 rounded border-white/30"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${goal.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                        {goal.text}
                      </p>
                      <p className="text-xs text-purple-300">+{goal.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setShowFlashcardModal(true)}
                className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 text-white rounded-xl p-3 text-left transition flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaBookOpen className="mr-2" />
                  Flashcards
                </span>
                <Badge variant="secondary" size="sm">{flashcards.length}</Badge>
              </button>

              <button
                onClick={() => setShowVocabModal(true)}
                className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/30 text-white rounded-xl p-3 text-left transition flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaPen className="mr-2" />
                  Vocabulary
                </span>
                <Badge variant="secondary" size="sm">{vocabulary.length}</Badge>
              </button>

              <button
                onClick={() => setShowPronunciationFeedback(true)}
                className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 text-white rounded-xl p-3 text-left transition flex items-center"
              >
                <FaMicrophone className="mr-2" />
                Pronunciation Practice
              </button>

              <button
                onClick={() => setShowWhiteboard(true)}
                className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-400/30 text-white rounded-xl p-3 text-left transition flex items-center"
              >
                <FaMagic className="mr-2" />
                Collaborative Whiteboard
              </button>
            </div>

            {/* Achievements Preview */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <FaMedal className="mr-2 text-yellow-400" />
                Recent Achievements
              </h3>
              <div className="space-y-2">
                {achievements.slice(-3).map((ach, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-white/80 text-sm">
                    <span className="text-xl">{ach.icon}</span>
                    <span>{ach.name}</span>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-white/50 text-sm">No achievements yet. Keep learning!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Main Room Area */}
        <div className="flex-1 flex flex-col">
          {/* View Mode Selector */}
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  viewMode === 'grid'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('speaker')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  viewMode === 'speaker'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Speaker View
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  viewMode === 'gallery'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Gallery
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <FaUsers />
                <span>{participants.length} participants</span>
              </div>
              {raisedHands.size > 0 && (
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <FaHandPaper />
                  <span>{raisedHands.size} hands raised</span>
                </div>
              )}
            </div>
          </div>

          {/* Participants Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <EnhancedParticipantsGrid
              participants={participants}
              speakingUsers={speakingUsers}
              currentUser={user}
              isHost={isHost}
              isModerator={isModerator}
              viewMode={viewMode}
              isScreenSharing={isScreenSharing}
              raisedHands={raisedHands}
              onReport={(user) => {
                setSelectedUser(user);
                setShowReportModal(true);
              }}
              onKick={handleKickUser}
              onMute={handleMuteUser}
            />
          </div>

          {/* Enhanced Voice Controls */}
          <div className="bg-black/30 backdrop-blur-xl border-t border-white/10 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2">
                <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
                  <button
                    onClick={toggleMute}
                    disabled={!audioEnabled}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      !audioEnabled ? 'opacity-50 cursor-not-allowed bg-gray-700' :
                      isMuted 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
                  </button>
                </Tooltip>

                <Tooltip content={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isVideoEnabled
                        ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                        : 'bg-red-500/30 text-red-200 border border-red-400/30'
                    }`}
                  >
                    {isVideoEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
                  </button>
                </Tooltip>

                <Tooltip content={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                  <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isScreenSharing
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    <FaDesktop size={20} />
                  </button>
                </Tooltip>

                <Tooltip content={isDeafened ? 'Undeafen' : 'Deafen'}>
                  <button
                    onClick={toggleDeaf}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isDeafened 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    {isDeafened ? <FaVolumeMute size={20} /> : <FaHeadphones size={20} />}
                  </button>
                </Tooltip>

                <div className="relative">
                  <Tooltip content="Volume">
                    <button
                      onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                      className="p-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition border border-white/30"
                    >
                      {volume === 0 ? <FaVolumeOff size={20} /> : 
                       volume < 50 ? <FaVolumeDown size={20} /> : 
                       <FaVolumeUp size={20} />}
                    </button>
                  </Tooltip>
                  
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-0 mb-2 bg-black/80 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/20">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="text-center text-xs text-white/80 mt-2 font-mono">
                        {volume}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-2">
                <Tooltip content={isHandRaised ? 'Lower hand' : 'Raise hand'}>
                  <button
                    onClick={toggleHandRaise}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isHandRaised
                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50 animate-pulse'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    <FaHandPaper size={20} />
                  </button>
                </Tooltip>

                <Tooltip content={showTranscription ? 'Hide captions' : 'Show captions'}>
                  <button
                    onClick={() => setShowTranscription(!showTranscription)}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      showTranscription
                        ? 'bg-white/30 text-white border border-white/40'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    <FaClosedCaptioning size={20} />
                  </button>
                </Tooltip>

                <Tooltip content={isRecording ? 'Stop recording' : 'Start recording'}>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                      isRecording
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    {isRecording ? (
                      <div className="flex items-center space-x-2">
                        <FaStop size={20} />
                        <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
                      </div>
                    ) : (
                      <FaPlay size={20} />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Right Status */}
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={audioEnabled ? 'success' : 'warning'} 
                  size="sm"
                  className={audioEnabled ? 'bg-green-500/30 text-green-200 border border-green-400/30' : 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/30'}
                >
                  {audioEnabled ? '🔊 Connected' : '⚠️ Disconnected'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat & More */}
        {isSidebarOpen && (
          <EnhancedRoomSidebar
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
            onMaterialSelect={setSelectedMaterial}
            currentUser={user}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onReact={handleReactToMessage}
            messageReactions={messageReactions}
            polls={polls}
            onCreatePoll={createPoll}
            onVotePoll={votePoll}
            showPollModal={showPollModal}
            setShowPollModal={setShowPollModal}
            vocabulary={vocabulary}
            flashcards={flashcards}
            recordings={recordings}
            autoTranslate={autoTranslate}
            setAutoTranslate={setAutoTranslate}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
          />
        )}
      </div>

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
          setReportReason('');
        }}
        onSubmit={handleReportUser}
        reason={reportReason}
        setReason={setReportReason}
        user={selectedUser}
      />

      <FlashcardModal
        isOpen={showFlashcardModal}
        onClose={() => setShowFlashcardModal(false)}
        flashcards={flashcards}
        currentIndex={currentFlashcard}
        setCurrentIndex={setCurrentFlashcard}
        onMastered={(id) => {
          setFlashcards(prev => prev.map(f => f.id === id ? { ...f, mastered: true } : f));
          awardPoints(10, 'Mastered flashcard');
        }}
      />

      <VocabularyModal
        isOpen={showVocabModal}
        onClose={() => setShowVocabModal(false)}
        vocabulary={vocabulary}
        onMarkLearned={(id) => {
          setVocabulary(prev => prev.map(v => v.id === id ? { ...v, learned: true } : v));
          awardPoints(8, 'Learned vocabulary');
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={leaderboard}
        currentUser={{ ...user, points: userPoints, streak: userStreak }}
      />

      {showTranscription && (
        <TranscriptionOverlay
          transcription={transcription}
          onClose={() => setShowTranscription(false)}
        />
      )}
    </div>
  );
};

// Enhanced Participants Grid Component
const EnhancedParticipantsGrid = ({ 
  participants, 
  speakingUsers, 
  currentUser, 
  isHost, 
  isModerator, 
  viewMode,
  isScreenSharing,
  raisedHands,
  onReport, 
  onKick, 
  onMute 
}) => {
  const gridClasses = {
    grid: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    speaker: 'flex flex-col space-y-4',
    gallery: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
  };

  return (
    <div className={gridClasses[viewMode]}>
      {participants.map((p) => {
        const isSpeaking = speakingUsers.has(p.user?._id);
        const isCurrentUser = p.user?._id === currentUser?._id;
        const hasHandRaised = raisedHands.has(p.user?._id);
        
        return (
          <div
            key={p.user?._id}
            className={`relative group bg-black/30 backdrop-blur-sm rounded-2xl p-4 hover:bg-black/40 transition-all border ${
              isSpeaking 
                ? 'ring-4 ring-green-500/50 shadow-lg shadow-green-500/20' 
                : 'border-white/10 hover:border-white/20'
            } ${viewMode === 'speaker' && isSpeaking ? 'row-span-2 col-span-2' : ''}`}
          >
            {/* Video/Avatar Container */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl overflow-hidden mb-3">
              {p.videoEnabled ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={isCurrentUser}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar
                    src={p.user?.avatar}
                    alt={p.user?.username}
                    size="xl"
                    className="shadow-2xl"
                  />
                </div>
              )}
              
              {/* Speaking Indicator */}
              {isSpeaking && (
                <div className="absolute bottom-2 left-2 flex space-x-1">
                  <div className="w-1.5 h-6 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-6 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-6 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}

              {/* Raised Hand Indicator */}
              {hasHandRaised && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white p-2 rounded-full animate-bounce shadow-lg">
                  <FaHandPaper size={16} />
                </div>
              )}

              {/* Role Badge */}
              {p.role === 'speaker' && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center">
                  <FaMicrophone className="mr-1" size={10} />
                  Speaker
                </div>
              )}

              {/* Host Badge */}
              {p.user?._id === currentUser?._id && isHost && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center">
                  <FaStar className="mr-1" size={10} />
                  Host
                </div>
              )}

              {/* Mute Indicator */}
              {p.isMuted && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-2 shadow-lg">
                  <FaMicrophoneSlash size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center">
              <p className="text-white font-semibold truncate text-sm">
                {p.user?.username}
                {isCurrentUser && ' (You)'}
              </p>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <Badge variant="secondary" size="sm" className="bg-white/10 text-white/70 text-xs">
                  {p.role}
                </Badge>
                {p.user?.level && (
                  <Badge variant="primary" size="sm" className="bg-purple-500/30 text-purple-200 text-xs">
                    Lvl {p.user.level}
                  </Badge>
                )}
              </div>
            </div>

            {/* Moderation Actions */}
            {(isModerator || isHost) && !isCurrentUser && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2">
                <Tooltip content="Mute User">
                  <button
                    onClick={() => onMute(p.user?._id)}
                    className="p-3 bg-yellow-600 rounded-full hover:bg-yellow-700 transform hover:scale-110 transition shadow-lg"
                  >
                    <FaMicrophoneSlash size={16} className="text-white" />
                  </button>
                </Tooltip>
                <Tooltip content="Kick User">
                  <button
                    onClick={() => onKick(p.user?._id)}
                    className="p-3 bg-red-600 rounded-full hover:bg-red-700 transform hover:scale-110 transition shadow-lg"
                  >
                    <FaBan size={16} className="text-white" />
                  </button>
                </Tooltip>
                <Tooltip content="Report User">
                  <button
                    onClick={() => onReport(p.user)}
                    className="p-3 bg-orange-600 rounded-full hover:bg-orange-700 transform hover:scale-110 transition shadow-lg"
                  >
                    <FaFlag size={16} className="text-white" />
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

// Enhanced Room Sidebar
const EnhancedRoomSidebar = ({
  activeTab,
  setActiveTab,
  participants,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  typingUsers,
  materials,
  onUploadClick,
  onMaterialSelect,
  currentUser,
  replyingTo,
  setReplyingTo,
  onReact,
  messageReactions,
  polls,
  onCreatePoll,
  onVotePoll,
  showPollModal,
  setShowPollModal,
  vocabulary,
  flashcards,
  recordings,
  autoTranslate,
  setAutoTranslate,
  targetLanguage,
  setTargetLanguage
}) => {
  const tabs = [
    { id: 'chat', icon: FaComments, label: 'Chat', badge: messages.length },
    { id: 'participants', icon: FaUsers, label: 'People', badge: participants.length },
    { id: 'materials', icon: FaFile, label: 'Materials', badge: materials.length },
    { id: 'polls', icon: FaPoll, label: 'Polls', badge: polls.length },
    { id: 'recordings', icon: FaPlay, label: 'Recordings', badge: recordings.length },
  ];

  return (
    <div className="w-80 lg:w-96 bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max px-3 py-3 text-xs font-medium transition relative ${
              activeTab === tab.id
                ? 'text-white bg-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center space-x-1.5">
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {tab.badge}
                </span>
              )}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <EnhancedChatTab
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={onSendMessage}
            typingUsers={typingUsers}
            currentUser={currentUser}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onReact={onReact}
            messageReactions={messageReactions}
            autoTranslate={autoTranslate}
            setAutoTranslate={setAutoTranslate}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
          />
        )}

        {activeTab === 'participants' && (
          <EnhancedParticipantsTab
            participants={participants}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'materials' && (
          <EnhancedMaterialsTab
            materials={materials}
            onUploadClick={onUploadClick}
            onMaterialSelect={onMaterialSelect}
          />
        )}

        {activeTab === 'polls' && (
          <EnhancedPollsTab
            polls={polls}
            onVotePoll={onVotePoll}
            onCreatePoll={() => setShowPollModal(true)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'recordings' && (
          <RecordingsTab
            recordings={recordings}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Chat Tab with more features
const EnhancedChatTab = ({
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  typingUsers,
  currentUser,
  replyingTo,
  setReplyingTo,
  onReact,
  messageReactions,
  autoTranslate,
  setAutoTranslate,
  targetLanguage,
  setTargetLanguage
}) => {
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reactions = ['👍', '❤️', '😂', '🎉', '🤔', '👏'];

  return (
    <div className="h-full flex flex-col">
      {/* Translation Toggle */}
      <div className="p-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="rounded border-white/30"
            />
            <span>Auto-translate</span>
          </label>
          {autoTranslate && (
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <EnhancedChatMessage
            key={message.id}
            message={message}
            currentUser={currentUser}
            onReply={setReplyingTo}
            onReact={onReact}
            reactions={messageReactions[message.id] || {}}
            availableReactions={reactions}
          />
        ))}
        {typingUsers.size > 0 && (
          <TypingIndicator users={Array.from(typingUsers)} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-white/60">Replying to {replyingTo.user?.username}</p>
            <p className="text-sm text-white/80 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-white/60 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSendMessage} className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/10 text-white rounded-xl pl-4 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20 placeholder-white/40"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <FaRegSmile size={18} />
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 text-purple-400 hover:text-purple-300 disabled:opacity-30 transition"
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Enhanced Chat Message with reactions and replies
const EnhancedChatMessage = ({ message, currentUser, onReply, onReact, reactions, availableReactions }) => {
  const isOwn = message.user?._id === currentUser?._id;
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <Avatar 
            src={message.user?.avatar} 
            alt={message.user?.username} 
            size="sm" 
            className="mr-2 ring-2 ring-white/20" 
          />
        )}
        <div>
          {!isOwn && (
            <p className="text-xs text-white/60 mb-1 px-1">{message.user?.username}</p>
          )}
          
          {/* Reply Preview */}
          {message.replyTo && (
            <div className="mb-1 px-3 py-2 bg-white/5 rounded-lg border-l-2 border-purple-500">
              <p className="text-xs text-white/60">{message.replyTo.user?.username}</p>
              <p className="text-xs text-white/80 truncate">{message.replyTo.content}</p>
            </div>
          )}
          
          <div className="relative">
            <div className={`rounded-2xl px-4 py-2.5 ${
              isOwn 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
            }`}>
              <p className="text-sm break-words">{message.content}</p>
            </div>
            
            {/* Reactions */}
            {Object.keys(reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(reactions).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 text-xs flex items-center space-x-1 hover:bg-white/20 transition"
                  >
                    <span>{emoji}</span>
                    <span className="text-white/80">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Message Actions */}
          <div className={`flex items-center space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="text-xs text-white/60 hover:text-white"
            >
              <FaRegSmile size={12} />
            </button>
            <button
              onClick={() => onReply(message)}
              className="text-xs text-white/60 hover:text-white"
            >
              Reply
            </button>
            <p className="text-xs text-white/40">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          {/* Reaction Picker */}
          {showReactions && (
            <div className="flex items-center space-x-1 mt-1 bg-black/80 backdrop-blur-xl rounded-full px-2 py-1 border border-white/20">
              {availableReactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactions(false);
                  }}
                  className="hover:scale-125 transition text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Continue with more components...
// (Character limit reached, will continue in next part)

// Room Preview Component (enhanced)
const RoomPreview = ({ room, showPasswordInput, password, setPassword, onJoin, onBack, isAuthenticated }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full">
      <button
        onClick={onBack}
        className="flex items-center text-white/80 hover:text-white mb-6 transition"
      >
        <FaChevronLeft className="mr-2" />
        Back to Rooms
      </button>

      <div className="bg-black/20 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-3">{room.name}</h1>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border border-white/30">
                    {room.language}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border border-white/30">
                    {room.topic}
                  </Badge>
                  {room.isPrivate && (
                    <Badge variant="warning" className="bg-yellow-500/30 text-yellow-100 border border-yellow-400/30">
                      🔒 Private
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <FaUsers className="text-2xl" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{room.participants?.length || 0}</p>
                  <p className="text-sm opacity-80">/ {room.maxParticipants}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <Avatar src={room.host?.avatar} alt={room.host?.username} size="lg" className="ring-4 ring-purple-500/30" />
            <div>
              <p className="text-sm text-white/60">Hosted by</p>
              <p className="font-semibold text-white text-lg">{room.host?.username}</p>
              {room.host?.level && (
                <Badge variant="primary" size="sm" className="mt-1 bg-purple-500/30 text-purple-200">
                  Level {room.host.level}
                </Badge>
              )}
            </div>
          </div>

          {room.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-white text-lg mb-3 flex items-center">
                <FaBookOpen className="mr-2 text-purple-400" />
                About this room
              </h3>
              <p className="text-white/80 leading-relaxed bg-white/5 rounded-xl p-4 border border-white/10">
                {room.description}
              </p>
            </div>
          )}

          {room.tags?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-white text-lg mb-3 flex items-center">
                <FaTag className="mr-2 text-pink-400" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm border border-white/20 hover:bg-white/20 transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Join Section */}
          <div className="border-t border-white/10 pt-8">
            {!isAuthenticated ? (
              <div className="text-center bg-white/5 rounded-xl p-8 border border-white/10">
                <div className="text-6xl mb-4">🔐</div>
                <p className="text-white/80 text-lg mb-6">Please log in to join this room</p>
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg">
                    Log In to Join
                  </Button>
                </Link>
              </div>
            ) : showPasswordInput ? (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/40"
                />
                <div className="flex space-x-3">
                  <Button 
                    onClick={onJoin} 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 py-4 text-lg"
                  >
                    Join Room
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordInput(false)}
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20 py-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={onJoin} 
                size="lg" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 py-4 text-lg font-semibold shadow-lg shadow-purple-500/30"
              >
                🎉 Join Room
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Additional helper components would continue here...
// (Due to length constraints, showing main structure)

export default EnhancedRoomDetail;