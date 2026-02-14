import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch } from 'react-icons/fa';
import RoomCard from '../components/rooms/RoomCard';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import { fetchRooms } from '../store/slices/roomSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const Rooms = () => {
  const dispatch = useDispatch();
  const { rooms, isLoading, error, pagination } = useSelector((state) => state.rooms);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const languages = ['All', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'];
  const topics = ['All', 'Casual Talk', 'Language Learning', 'Business', 'Technology', 'Culture', 'Travel'];

  useEffect(() => {
    loadRooms();
  }, [selectedLanguage, selectedTopic]);

  const loadRooms = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (selectedLanguage && selectedLanguage !== 'All') {
        params.language = selectedLanguage;
      }
      
      if (selectedTopic && selectedTopic !== 'All') {
        params.topic = selectedTopic;
      }
      
      await dispatch(fetchRooms(params)).unwrap();
    } catch (error) {
      toast.error(error || 'Failed to load rooms');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search
    loadRooms();
  };

  const handleCreateRoom = (newRoom) => {
    toast.success('Room created successfully!');
  };

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Language Rooms</h1>
        {isAuthenticated && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Room</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<FaSearch className="text-gray-400" />}
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          <div className="flex space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Rooms Grid */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms found</p>
          <p className="text-gray-400 mt-2">
            {isAuthenticated 
              ? 'Be the first to create a room!' 
              : 'Login to create a new room'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => dispatch(fetchRooms({ ...pagination, page }))}
              className={`px-4 py-2 rounded-md ${
                pagination.page === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
};

export default Rooms;