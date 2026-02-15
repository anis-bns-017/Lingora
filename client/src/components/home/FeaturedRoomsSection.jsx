import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import { fetchRooms } from '../../store/slices/roomSlice';
import RoomCard from '../rooms/RoomCard';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

const FeaturedRoomsSection = () => {
  const dispatch = useDispatch();
  const { rooms, isLoading } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(fetchRooms({ limit: 6, page: 1 }));
  }, [dispatch]);

  if (!rooms || rooms.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
          <Badge variant="primary" className="mb-2 inline-block">Live Now</Badge>
          <h2 className="text-3xl font-bold">
            Active <span className="text-primary-600">Rooms</span>
          </h2>
          <p className="text-gray-600">Join conversations happening right now</p>
        </div>
        <Link 
          to="/rooms" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group mt-4 sm:mt-0"
        >
          View All Rooms
          <FaChevronRight className="ml-1 group-hover:translate-x-1 transition" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.slice(0, 6).map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedRoomsSection;