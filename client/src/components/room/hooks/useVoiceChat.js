import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const useVoiceChat = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  const setupVoiceChat = async () => {
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
      
      setAudioEnabled(true);
      return stream;
    } catch (error) {
      console.error('Failed to get microphone access:', error);
      toast.error('Please allow microphone access to speak');
      setAudioEnabled(false);
      return null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      toast.success(!isMuted ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const toggleDeaf = () => {
    setIsDeafened(!isDeafened);
    // Mute all audio outputs
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = !isDeafened;
    });
    toast.success(!isDeafened ? 'Sound muted' : 'Sound unmuted');
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    
    // Adjust all audio elements volume
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume / 100;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isMuted,
    setIsMuted,
    isDeafened,
    setIsDeafened,
    volume,
    setVolume,
    audioEnabled,
    speakingUsers,
    setSpeakingUsers,
    localStream: localStreamRef.current,
    setupVoiceChat,
    toggleMute,
    toggleDeaf,
    handleVolumeChange
  };
};

export default useVoiceChat;