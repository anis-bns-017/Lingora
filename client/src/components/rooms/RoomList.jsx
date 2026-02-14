import React from 'react';
import RoomCard from './RoomCard';
import EmptyState from '../ui/EmptyState';
import { FaComments } from 'react-icons/fa';

const RoomList = ({ rooms, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">Error loading rooms</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={<FaComments className="text-gray-400 text-6xl" />}
        title="No rooms found"
        description="There are no active rooms matching your criteria. Be the first to create one!"
        actionLabel="Create Room"
        onAction={() => window.location.href = '/rooms?create=true'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
};

export default RoomList;