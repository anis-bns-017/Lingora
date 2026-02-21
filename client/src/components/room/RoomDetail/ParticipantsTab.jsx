import React from 'react';
import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';

const ParticipantsTab = ({ participants, currentUser }) => {
  // Group by role
  const speakers = participants.filter(p => p.role === 'speaker');
  const listeners = participants.filter(p => p.role === 'listener');

  return (
    <div className="p-4 space-y-6">
      {/* Speakers */}
      {speakers.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Speakers · {speakers.length}
          </h4>
          <div className="space-y-2">
            {speakers.map((p) => (
              <ParticipantRow
                key={p.user?._id}
                participant={p}
                isCurrentUser={p.user?._id === currentUser?._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Listeners */}
      {listeners.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Listeners · {listeners.length}
          </h4>
          <div className="space-y-2">
            {listeners.map((p) => (
              <ParticipantRow
                key={p.user?._id}
                participant={p}
                isCurrentUser={p.user?._id === currentUser?._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ParticipantRow = ({ participant, isCurrentUser }) => {
  const user = participant.user;

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition">
      <div className="flex items-center space-x-3">
        <Avatar src={user?.avatar} alt={user?.username} size="sm" />
        <div>
          <p className="text-white text-sm font-medium">
            {user?.username}
            {isCurrentUser && ' (You)'}
          </p>
          <p className="text-xs text-gray-400">{participant.role}</p>
        </div>
      </div>
      {participant.role === 'speaker' && (
        <Badge variant="success" size="sm">Speaker</Badge>
      )}
    </div>
  );
};

export default ParticipantsTab;