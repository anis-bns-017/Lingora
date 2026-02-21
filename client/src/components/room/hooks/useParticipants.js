import { useCallback } from 'react';
import socketService from '../../../services/socketService';
import toast from 'react-hot-toast';

const useParticipants = ({ roomId, participants, setParticipants }) => {
  const handleKickUser = useCallback((userId) => {
    if (window.confirm('Are you sure you want to kick this user?')) {
      socketService.socket?.emit('kick-user', { roomId, userId });
      setParticipants(prev => prev.filter(p => p.user?._id !== userId));
      toast.success('User kicked from room');
    }
  }, [roomId, setParticipants]);

  const handleMuteUser = useCallback((userId) => {
    socketService.socket?.emit('mute-user', { roomId, userId });
    setParticipants(prev => prev.map(p => 
      p.user?._id === userId ? { ...p, isMuted: !p.isMuted } : p
    ));
    toast.success('User muted');
  }, [roomId, setParticipants]);

  const handleReportUser = useCallback((userId, reason) => {
    socketService.socket?.emit('report-user', { roomId, userId, reason });
    toast.success('User reported to moderators');
  }, [roomId]);

  const handlePromoteToSpeaker = useCallback((userId) => {
    socketService.socket?.emit('change-role', { 
      roomId, 
      userId, 
      role: 'speaker' 
    });
    setParticipants(prev => prev.map(p => 
      p.user?._id === userId ? { ...p, role: 'speaker' } : p
    ));
    toast.success('User promoted to speaker');
  }, [roomId, setParticipants]);

  const handleDemoteToListener = useCallback((userId) => {
    socketService.socket?.emit('change-role', { 
      roomId, 
      userId, 
      role: 'listener' 
    });
    setParticipants(prev => prev.map(p => 
      p.user?._id === userId ? { ...p, role: 'listener' } : p
    ));
    toast.success('User demoted to listener');
  }, [roomId, setParticipants]);

  return {
    handleKickUser,
    handleMuteUser,
    handleReportUser,
    handlePromoteToSpeaker,
    handleDemoteToListener
  };
};

export default useParticipants;