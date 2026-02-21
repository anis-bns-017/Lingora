import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaSearch, FaFilter, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import RoomCard from '../components/rooms/RoomCard';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import { fetchRooms, clearError } from '../store/slices/roomSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Rooms = () => {
  const dispatch = useDispatch();
  const { rooms, isLoading, error, pagination } = useSelector((state) => state.rooms);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'popular', 'alphabetical'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const languages = ['All', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'];
  const topics = ['All', 'Casual Talk', 'Language Learning', 'Business', 'Technology', 'Culture', 'Travel'];

  // Load rooms with current filters
  const loadRooms = useCallback(async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };
      
      if (selectedLanguage && selectedLanguage !== 'All') {
        params.language = selectedLanguage;
      }
      
      if (selectedTopic && selectedTopic !== 'All') {
        params.topic = selectedTopic;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }
      
      await dispatch(fetchRooms(params)).unwrap();
      
      // Update applied filters for display
      setAppliedFilters({
        language: selectedLanguage !== 'All' ? selectedLanguage : null,
        topic: selectedTopic !== 'All' ? selectedTopic : null,
        search: searchTerm || null
      });
    } catch (error) {
      toast.error(error || 'Failed to load rooms');
    }
  }, [dispatch, pagination.page, pagination.limit, selectedLanguage, selectedTopic, searchTerm, sortBy, sortOrder]);

  // Initial load and filter changes
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadRooms();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (searchTerm) {
      // Reload without search term
      setTimeout(() => loadRooms(), 0);
    }
  };

  const handleClearFilters = () => {
    setSelectedLanguage('');
    setSelectedTopic('');
    setSearchTerm('');
    setSortBy('newest');
    setSortOrder('desc');
    setAppliedFilters({});
    
    // Reload with cleared filters
    setTimeout(() => loadRooms(), 0);
  };

  const handleCreateRoom = (newRoom) => {
    toast.success('Room created successfully!');
    // Optionally refresh the rooms list
    loadRooms();
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Count active filters
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Language Rooms</h1>
          <p className="text-gray-600 mt-1">
            Join conversations with language learners from around the world
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 whitespace-nowrap"
            size="lg"
          >
            <FaPlus />
            <span>Create Room</span>
          </Button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search rooms by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<FaSearch className="text-gray-400" />}
                className="pr-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="whitespace-nowrap">
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <FaFilter className="mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="primary" size="sm" className="absolute -top-2 -right-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="pt-4 border-t animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="active">Most Active</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between hover:bg-gray-50"
                  >
                    <span>{sortOrder === 'desc' ? 'Descending' : 'Ascending'}</span>
                    {sortOrder === 'desc' ? <FaSortAmountDown className="text-gray-500" /> : <FaSortAmountUp className="text-gray-500" />}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {appliedFilters.language && (
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      Language: {appliedFilters.language}
                      <button
                        onClick={() => setSelectedLanguage('')}
                        className="ml-1 hover:text-primary-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </Badge>
                  )}
                  {appliedFilters.topic && (
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      Topic: {appliedFilters.topic}
                      <button
                        onClick={() => setSelectedTopic('')}
                        className="ml-1 hover:text-primary-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </Badge>
                  )}
                  {appliedFilters.search && (
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      Search: "{appliedFilters.search}"
                      <button
                        onClick={handleClearSearch}
                        className="ml-1 hover:text-primary-800"
                      >
                        <FaTimes size={12} />
                      </button>
                    </Badge>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-red-600 hover:text-red-700 ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>
          Showing <span className="font-medium">{rooms.length}</span> rooms
          {activeFilterCount > 0 && ' with applied filters'}
        </p>
        {!isLoading && rooms.length > 0 && (
          <p className="text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
        )}
      </div>

      {/* Rooms Grid */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-start gap-3">
          <div className="flex-1">
            <p className="font-medium">Error loading rooms</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadRooms}>
            Try Again
          </Button>
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<FaSearch className="text-gray-400 text-6xl" />}
          title="No rooms found"
          description={
            searchTerm || selectedLanguage || selectedTopic
              ? "No rooms match your search criteria. Try adjusting your filters."
              : isAuthenticated 
                ? "Be the first to create a room and start practicing!"
                : "Login to create a new room and join the conversation."
          }
          actionLabel={isAuthenticated ? "Create Room" : "Login"}
          onAction={() => isAuthenticated ? setIsCreateModalOpen(true) : navigate('/login')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            {/* Previous Page */}
            <button
              onClick={() => dispatch(fetchRooms({ ...pagination, page: pagination.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => dispatch(fetchRooms({ ...pagination, page: pageNum }))}
                  className={`px-4 py-2 rounded-md ${
                    pagination.page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => dispatch(fetchRooms({ ...pagination, page: pagination.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
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