import React from 'react';
import ParticipantCard from './ParticipantCard';

const ParticipantsGrid = ({ 
  participants, 
  speakingUsers, 
  currentUser, 
  isHost, 
  isModerator,
  onReport,
  onKick,
  onMute,
  onPromote,
  onDemote
}) => {
  // Separate speakers and listeners
  const speakers = participants.filter(p => p.role === 'speaker');
  const listeners = participants.filter(p => p.role === 'listener');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Speakers Section */}
      {speakers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white text-sm font-medium mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Speakers ({speakers.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {speakers.map((participant) => (
              <ParticipantCard
                key={participant.user?._id}
                participant={participant}
                isSpeaking={speakingUsers.has(participant.user?._id)}
                isCurrentUser={participant.user?._id === currentUser?._id}
                isHost={isHost}
                isModerator={isModerator}
                onReport={onReport}
                onKick={onKick}
                onMute={onMute}
                onPromote={onPromote}
                onDemote={onDemote}
              />
            ))}
          </div>
        </div>
      )}

      {/* Listeners Section */}
      {listeners.length > 0 && (
        <div>
          <h3 className="text-white text-sm font-medium mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Listeners ({listeners.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {listeners.map((participant) => (
              <ParticipantCard
                key={participant.user?._id}
                participant={participant}
                isSpeaking={speakingUsers.has(participant.user?._id)}
                isCurrentUser={participant.user?._id === currentUser?._id}
                isHost={isHost}
                isModerator={isModerator}
                onReport={onReport}
                onKick={onKick}
                onMute={onMute}
                onPromote={onPromote}
                onDemote={onDemote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsGrid;