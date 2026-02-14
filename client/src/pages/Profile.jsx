import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaCamera, FaUsers, FaLanguage, FaCalendar, FaGlobe, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Components
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import RoomCard from '../components/rooms/RoomCard';

// Services
import userService from '../services/userService';
import roomService from '../services/roomService';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [profile, setProfile] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    learningLanguages: []
  });

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    loadProfile();
    loadUserRooms();
  }, [id]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserProfile(id);
      setProfile(response.data);
      setFollowersCount(response.data.followers?.length || 0);
      setFollowingCount(response.data.following?.length || 0);
      setIsFollowing(response.data.followers?.some(f => f._id === currentUser?._id));
      
      setEditForm({
        bio: response.data.bio || '',
        learningLanguages: response.data.learningLanguages || []
      });
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRooms = async () => {
    try {
      const response = await roomService.getRooms({ host: id, limit: 5 });
      setUserRooms(response.data || []);
    } catch (error) {
      console.error('Failed to load user rooms:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(id);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await userService.followUser(id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success(`Following ${profile.username}`);
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await userService.updateProfile(editForm);
      setProfile(updated.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddLanguage = () => {
    setEditForm(prev => ({
      ...prev,
      learningLanguages: [...prev.learningLanguages, { language: '', level: 'beginner' }]
    }));
  };

  const handleRemoveLanguage = (index) => {
    setEditForm(prev => ({
      ...prev,
      learningLanguages: prev.learningLanguages.filter((_, i) => i !== index)
    }));
  };

  const handleLanguageChange = (index, field, value) => {
    const updated = [...editForm.learningLanguages];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm(prev => ({ ...prev, learningLanguages: updated }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-2xl relative">
        {isOwnProfile && (
          <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
            <FaCamera className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-b-2xl shadow-md px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end -mt-16">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white hover:bg-primary-700">
                <FaCamera size={14} />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 md:ml-6 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profile.username}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <FaUsers />
                    <span>{followersCount} followers</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-1">
                    <FaUsers />
                    <span>{followingCount} following</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-3">
                {isOwnProfile ? (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    className={`flex items-center space-x-2 ${
                      isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserCheck />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{profile.roomsHosted || 0}</div>
            <div className="text-sm text-gray-500">Rooms Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{profile.totalSessions || 0}</div>
            <div className="text-sm text-gray-500">Practice Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{profile.languagesLearned || 0}</div>
            <div className="text-sm text-gray-500">Languages</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - About */}
        <div className="md:col-span-1 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600">{profile.bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
              <FaLanguage className="text-primary-600" />
              <span>Languages</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Native</h4>
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-green-500" />
                  <span className="font-medium">{profile.nativeLanguage}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Learning</h4>
                {isEditing ? (
                  <div className="space-y-3">
                    {editForm.learningLanguages.map((lang, index) => (
                      <div key={index} className="flex space-x-2">
                        <select
                          value={lang.language}
                          onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select language</option>
                          {languages.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <select
                          value={lang.level}
                          onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="fluent">Fluent</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add Language
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.learningLanguages?.length > 0 ? (
                      profile.learningLanguages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-sm text-gray-500 capitalize">{lang.level}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Not learning any languages yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === 'about'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === 'rooms'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rooms
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === 'activity'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Activity
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        #{interest}
                      </span>
                    ))}
                    {(!profile.interests || profile.interests.length === 0) && (
                      <p className="text-gray-500">No interests listed</p>
                    )}
                  </div>

                  <h4 className="font-medium mt-4">Achievements</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.achievements?.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-gray-500">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Rooms</h4>
                  {userRooms.length > 0 ? (
                    <div className="grid gap-4">
                      {userRooms.map(room => (
                        <RoomCard key={room._id} room={room} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No rooms created yet</p>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-3">
                    {profile.recentActivity?.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!profile.recentActivity || profile.recentActivity.length === 0) && (
                      <p className="text-gray-500">No recent activity</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Actions */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  bio: profile.bio || '',
                  learningLanguages: profile.learningLanguages || []
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;