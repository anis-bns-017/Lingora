import React, { useState, useRef, useEffect } from 'react';
import { 
  FaMicrophone, FaStop, FaPlay, FaHeart, 
  FaHeadphones, FaCheckCircle, FaTrash, FaRedo,
  FaPause, FaSave, FaShare, FaChartLine, FaRobot,
  FaStar, FaUserFriends, FaClock, FaWaveSquare,
  FaVolumeUp, FaVolumeMute, FaDownload, FaCopy
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import toast from 'react-hot-toast';

// Components
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import Tooltip from '../ui/Tooltip';

const VoicePracticeSection = ({ userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permission, setPermission] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  
  // Refs
  const mediaRecorder = useRef(null);
  const audioStream = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const timerRef = useRef(null);
  const recordingChunks = useRef([]);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const animationFrame = useRef(null);

  // Sample phrases
  const phrases = [
    { id: 1, text: 'Hello, how are you today?', difficulty: 'Beginner' },
    { id: 2, text: 'Nice to meet you. Where are you from?', difficulty: 'Beginner' },
    { id: 3, text: 'I love learning new languages every day.', difficulty: 'Intermediate' },
    { id: 4, text: 'Could you please speak a bit slower?', difficulty: 'Intermediate' },
    { id: 5, text: 'The weather is absolutely beautiful today.', difficulty: 'Advanced' },
    { id: 6, text: 'I would like to order a cup of coffee.', difficulty: 'Beginner' }
  ];

  // Sample feedback data
  const [feedbacks, setFeedbacks] = useState([
    { 
      id: 1,
      name: 'Maria S.', 
      time: '2h ago', 
      comment: 'Great pronunciation! Just work on the intonation a bit.',
      likes: 5,
      audioId: 'rec1',
      isNative: true
    },
    { 
      id: 2,
      name: 'John D.', 
      time: '5h ago', 
      comment: 'Perfect accent! Where are you from?',
      likes: 3,
      audioId: 'rec1',
      isNative: false
    },
    { 
      id: 3,
      name: 'Yuki T.', 
      time: '1d ago', 
      comment: 'Very clear! Try to speak a bit slower for better flow.',
      likes: 7,
      audioId: 'rec2',
      isNative: true
    }
  ]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#6366f1',
        progressColor: '#4f46e5',
        cursorColor: '#333',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        barGap: 2,
        backend: 'WebAudio'
      });

      wavesurfer.current.on('finish', () => setIsPlaying(false));
      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  // Timer for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        updateAudioLevel();
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Update audio level meter
  const updateAudioLevel = () => {
    if (analyser.current && audioContext.current) {
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      analyser.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Smooth the value for better visualization
      setAudioLevel(prev => prev * 0.7 + average * 0.3);
    }
    
    // Continue updating while recording
    if (isRecording && !isPaused) {
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Clean up animation frame
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Request microphone permission
  const rnMxsqP2FjDPfZAkMGysHRhoU2NqNyTyQA = async () => {
    try {
      audioStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Setup audio analyzer for visualization
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      const source = audioContext.current.createMediaStreamSource(audioStream.current);
      source.connect(analyser.current);
      
      setPermission(true);
      toast.success('Microphone access granted!');
    } catch (error) {
      toast.error('Microphone permission denied');
      console.error('Error accessing microphone:', error);
    }
  };

  // Start recording - FIXED VERSION
  const startRecording = async () => {
    if (!permission) {
      await rnMxsqP2FjDPfZAkMGysHRhoU2NqNyTyQA();
    }

    if (audioStream.current) {
      // Clear previous chunks
      recordingChunks.current = [];
      
      // Create MediaRecorder with specific MIME type for better compatibility
      const options = { mimeType: 'audio/webm' };
      try {
        mediaRecorder.current = new MediaRecorder(audioStream.current, options);
      } catch (e) {
        // Fallback for browsers that don't support webm
        mediaRecorder.current = new MediaRecorder(audioStream.current);
      }

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunks.current.push(event.data);
          console.log('Chunk received:', event.data.size); // Debug log
        }
      };

      mediaRecorder.current.onstop = () => {
        // Create blob from all chunks
        const audioBlob = new Blob(recordingChunks.current, { type: 'audio/webm' });
        console.log('Total chunks:', recordingChunks.current.length, 'Blob size:', audioBlob.size); // Debug log
        
        if (audioBlob.size === 0) {
          toast.error('Recording failed - no audio data captured');
          return;
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newRecording = {
          id: Date.now(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date().toISOString(),
          phrase: selectedPhrase?.text || 'Custom recording',
          size: audioBlob.size
        };
        
        setRecordings(prev => [newRecording, ...prev]);
        setRecordingTime(0);
        
        // Load into wavesurfer
        if (wavesurfer.current) {
          wavesurfer.current.load(audioUrl);
        }
        
        toast.success('Recording saved!');
      };

      // Start recording with timeslice to get data regularly
      mediaRecorder.current.start(1000); // Get data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start audio context if suspended
      if (audioContext.current && audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      
      // Start visualization
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Cancel animation frame
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      // Reset audio level
      setAudioLevel(0);
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.pause();
      setIsPaused(true);
      
      // Cancel animation frame while paused
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      
      // Resume visualization
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Play recording - FIXED VERSION
  const playRecording = (recording) => {
    if (selectedRecording?.id === recording.id && isPlaying) {
      // Pause if already playing
      wavesurfer.current.pause();
      setIsPlaying(false);
    } else {
      // Load and play new recording
      if (wavesurfer.current) {
        wavesurfer.current.load(recording.url);
        wavesurfer.current.on('ready', () => {
          wavesurfer.current.play();
        });
      }
      setSelectedRecording(recording);
    }
  };

  // Pause playback
  const pausePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.pause();
      setIsPlaying(false);
    }
  };

  // Delete recording
  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
    if (selectedRecording?.id === id) {
      setSelectedRecording(null);
      if (wavesurfer.current) {
        wavesurfer.current.empty();
      }
    }
    toast.success('Recording deleted');
  };

  // Save recording
  const saveRecording = (recording) => {
    // In real app, upload to server
    toast.success('Recording saved to your library!');
  };

  // Share recording
  const shareRecording = (recording) => {
    setShowFeedbackModal(true);
  };

  // Submit feedback
  const submitFeedback = (recordingId) => {
    const newFeedback = {
      id: Date.now(),
      name: 'You',
      time: 'Just now',
      comment: feedbackText,
      likes: 0,
      audioId: recordingId,
      isNative: false
    };
    
    setFeedbacks(prev => [newFeedback, ...prev]);
    setFeedbackText('');
    setShowFeedbackModal(false);
    toast.success('Feedback submitted!');
  };

  // Like feedback
  const likeFeedback = (feedbackId) => {
    setFeedbacks(prev => 
      prev.map(f => 
        f.id === feedbackId 
          ? { ...f, likes: f.likes + 1 } 
          : f
      )
    );
  };

  // AI Analysis
  const analyzePronunciation = async (recording) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        clarity: Math.floor(Math.random() * 30 + 70),
        accuracy: Math.floor(Math.random() * 30 + 65),
        fluency: Math.floor(Math.random() * 30 + 60),
        suggestions: [
          'Work on the "th" sound in "the" and "this"',
          'Try to connect words more smoothly',
          'Emphasize stressed syllables',
          'Practice rising intonation for questions'
        ],
        phonemes: [
          { sound: '/θ/', correct: 75, count: 12 },
          { sound: '/ð/', correct: 60, count: 8 },
          { sound: '/r/', correct: 90, count: 15 },
          { sound: '/l/', correct: 85, count: 10 }
        ]
      });
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="primary" className="mb-4 inline-block px-4 py-2">
            <FaMicrophone className="inline mr-2" />
            Voice Practice Studio
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Practice Speaking with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Voice Notes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Record yourself, get instant AI feedback, and receive corrections from native speakers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recording Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Recording Card */}
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Voice Recorder</h3>
                {!permission && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={rnMxsqP2FjDPfZAkMGysHRhoU2NqNyTyQA}
                  >
                    Enable Microphone
                  </Button>
                )}
              </div>

              {/* Waveform Visualization */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div ref={waveformRef} className="w-full h-24" />
                
                {/* Live Audio Level Meter */}
                {isRecording && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Audio Level</span>
                      <span>{Math.round(audioLevel)}%</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        animate={{ width: `${audioLevel}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition transform hover:scale-110 shadow-lg"
                    >
                      <FaMicrophone size={32} />
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition transform hover:scale-110"
                        >
                          <FaPlay size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          className="p-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition transform hover:scale-110"
                        >
                          <FaPause size={20} />
                        </button>
                      )}
                      <button
                        onClick={stopRecording}
                        className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform hover:scale-110"
                      >
                        <FaStop size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Recording Timer */}
                <div className="text-center">
                  <span className="text-3xl font-mono font-bold">
                    {formatTime(recordingTime)}
                  </span>
                  <span className="text-gray-500 ml-2">/ 02:00</span>
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">
                      {isPaused ? 'Paused' : 'Recording...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Practice Phrases */}
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center">
                  <FaHeadphones className="mr-2 text-primary-600" />
                  Practice Phrases
                </h4>
                <div className="grid gap-2">
                  {phrases.map((phrase) => (
                    <button
                      key={phrase.id}
                      onClick={() => setSelectedPhrase(phrase)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition ${
                        selectedPhrase?.id === phrase.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{phrase.text}</span>
                      <Badge 
                        variant={
                          phrase.difficulty === 'Beginner' ? 'success' :
                          phrase.difficulty === 'Intermediate' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {phrase.difficulty}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Recordings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaHeadphones className="mr-2 text-primary-600" />
                Your Recordings
                <Badge variant="primary" className="ml-2">
                  {recordings.length}
                </Badge>
              </h3>

              <div className="space-y-3">
                {recordings.length > 0 ? (
                  recordings.map((recording) => (
                    <motion.div
                      key={recording.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => playRecording(recording)}
                          className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
                        >
                          {selectedRecording?.id === recording.id && isPlaying ? (
                            <FaPause size={14} />
                          ) : (
                            <FaPlay size={14} />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium">
                            {recording.phrase}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(recording.duration)} • {new Date(recording.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tooltip content="Play">
                          <button
                            onClick={() => playRecording(recording)}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition"
                          >
                            <FaPlay size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Save">
                          <button
                            onClick={() => saveRecording(recording)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition"
                          >
                            <FaSave size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Share & Get Feedback">
                          <button
                            onClick={() => shareRecording(recording)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                          >
                            <FaShare size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip content="AI Analysis">
                          <button
                            onClick={() => analyzePronunciation(recording)}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition"
                          >
                            <FaRobot size={14} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition"
                          >
                            <FaTrash size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaMicrophone className="mx-auto text-4xl mb-3 text-gray-400" />
                    <p>No recordings yet. Start recording to practice!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Analysis & Feedback */}
          <div className="space-y-6">
            {/* AI Pronunciation Analysis */}
            <Card className="p-6 bg-gradient-to-br from-primary-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">AI Analysis</h3>
                <FaRobot size={24} className="opacity-80" />
              </div>

              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Spinner className="mx-auto mb-3" />
                  <p className="text-sm opacity-90">Analyzing your pronunciation...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white bg-opacity-20 rounded-lg">
                      <div className="text-xl font-bold">{aiAnalysis.clarity}%</div>
                      <div className="text-xs opacity-80">Clarity</div>
                    </div>
                    <div className="text-center p-2 bg-white bg-opacity-20 rounded-lg">
                      <div className="text-xl font-bold">{aiAnalysis.accuracy}%</div>
                      <div className="text-xs opacity-80">Accuracy</div>
                    </div>
                    <div className="text-center p-2 bg-white bg-opacity-20 rounded-lg">
                      <div className="text-xl font-bold">{aiAnalysis.fluency}%</div>
                      <div className="text-xs opacity-80">Fluency</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Phoneme Analysis</h4>
                    {aiAnalysis.phonemes.map((p, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Sound: {p.sound}</span>
                          <span>{p.correct}% correct</span>
                        </div>
                        <div className="h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full"
                            style={{ width: `${p.correct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Suggestions:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-xs flex items-start">
                          <FaCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaWaveSquare className="mx-auto text-4xl mb-3 opacity-50" />
                  <p className="text-sm opacity-90">
                    Record and select a recording to get AI analysis
                  </p>
                </div>
              )}
            </Card>

            {/* Community Feedback */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaUserFriends className="mr-2 text-primary-600" />
                Community Feedback
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedbacks.map((feedback) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Avatar 
                      src={`https://i.pravatar.cc/150?img=${feedback.id + 20}`} 
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{feedback.name}</p>
                          {feedback.isNative && (
                            <Badge size="sm" variant="success">Native</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{feedback.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{feedback.comment}</p>
                      <div className="flex items-center mt-2 space-x-3">
                        <button
                          onClick={() => likeFeedback(feedback.id)}
                          className="flex items-center text-xs text-gray-500 hover:text-red-500 transition"
                        >
                          <FaHeart className="mr-1" size={12} />
                          {feedback.likes}
                        </button>
                        <button className="text-xs text-gray-500 hover:text-primary-600 transition">
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Feedback */}
              <div className="mt-4 pt-4 border-t">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Write your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows="2"
                />
                <Button 
                  className="mt-2 w-full"
                  size="sm"
                  onClick={() => submitFeedback(selectedRecording?.id)}
                >
                  Submit Feedback
                </Button>
              </div>
            </Card>

            {/* Progress Tracker */}
            <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold">{recordings.length}</div>
                  <div className="text-xs opacity-80">Recordings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {feedbacks.filter(f => f.audioId === selectedRecording?.id).length}
                  </div>
                  <div className="text-xs opacity-80">Feedback</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-xs opacity-80">Practice Days</div>
                </div>
              </div>
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Goal</span>
                  <span>{recordings.length}/10 sessions</span>
                </div>
                <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${(recordings.length / 10) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button 
            size="lg" 
            className="px-8 bg-gradient-to-r from-primary-600 to-primary-700"
            onClick={startRecording}
          >
            <FaMicrophone className="mr-2" />
            Start New Recording
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="px-8"
            onClick={() => {
              toast.success('Loading example recordings...');
            }}
          >
            <FaHeadphones className="mr-2" />
            Listen to Examples
          </Button>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Share for Feedback"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share your recording with the community to get feedback from native speakers.
          </p>
          <div className="flex space-x-2">
            <Button className="flex-1">
              Share Publicly
            </Button>
            <Button variant="secondary" className="flex-1">
              Share with Friends
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default VoicePracticeSection;