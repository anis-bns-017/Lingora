import React from 'react';
import { FaComments, FaUsers, FaFile, FaTimes } from 'react-icons/fa';
import ChatTab from './ChatTab';
import ParticipantsTab from './ParticipantsTab';
import MaterialsTab from './MaterialsTab';

const RoomSidebar = ({ 
  activeTab, 
  setActiveTab, 
  participants, 
  messages,
  typingUsers,
  materials,
  currentUser,
  onSendMessage,
  onSendTyping,
  onUploadClick
}) => {
  const tabs = [
    { id: 'chat', icon: FaComments, label: 'Chat', count: messages.length },
    { id: 'participants', icon: FaUsers, label: 'People', count: participants.length },
    { id: 'materials', icon: FaFile, label: 'Materials', count: materials.length }
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-primary-500 border-b-2 border-primary-500 bg-gray-700/50'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <Icon className="inline mr-2" size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <ChatTab
            messages={messages}
            typingUsers={typingUsers}
            currentUser={currentUser}
            onSendMessage={onSendMessage}
            onSendTyping={onSendTyping}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsTab
            participants={participants}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab
            materials={materials}
            onUploadClick={onUploadClick}
          />
        )}
      </div>
    </div>
  );
};

export default RoomSidebar;