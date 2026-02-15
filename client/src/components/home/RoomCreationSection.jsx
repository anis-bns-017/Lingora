import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaMicrophone,
  FaUsers,
  FaGlobe,
  FaLock,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaVideo,
  FaVolumeUp,
  FaClock,
  FaRocket,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { createRoom } from "../../store/slices/roomSlice";
import toast from "react-hot-toast";

// Components
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Spinner from "../ui/Spinner";

const RoomCreationSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Room form state
  const [roomData, setRoomData] = useState({
    name: "",
    description: "",
    language: "",
    topic: "",
    type: "public",
    password: "",
    maxParticipants: 10,
    settings: {
      isVideoEnabled: true,
      isAudioEnabled: true,
      requireApproval: false,
      allowScreenShare: true,
      allowRecording: false,
      allowChat: true,
    },
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  // Languages data
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const topics = [
    "Casual Conversation",
    "Business English",
    "Grammar Practice",
    "Pronunciation",
    "Interview Prep",
    "Academic Writing",
    "Debate Club",
    "Book Club",
    "News Discussion",
    "Travel Talk",
    "Cultural Exchange",
    "Exam Preparation",
  ];

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!roomData.name.trim()) {
      errors.name = "Room name is required";
    } else if (roomData.name.length < 3) {
      errors.name = "Room name must be at least 3 characters";
    }
    
    if (!roomData.language) {
      errors.language = "Please select a language";
    }
    
    if (!roomData.topic) {
      errors.topic = "Please select a topic";
    }
    
    if (roomData.type === "private" && !roomData.password) {
      errors.password = "Password is required for private rooms";
    } else if (roomData.type === "private" && roomData.password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSettingChange = (setting, value) => {
    setRoomData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !roomData.tags.includes(tagInput.trim())) {
      setRoomData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setRoomData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting", {
        icon: "❌",
        duration: 4000,
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast.error("Please login to create a room", {
        icon: "🔒",
        duration: 4000,
      });
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading("Creating your room...");

      // Prepare room data for API
      const roomPayload = {
        ...roomData,
        host: user._id,
        hostName: user.username,
        hostAvatar: user.avatar,
        participants: [],
        speakers: [],
        listeners: [],
        status: "active",
        createdAt: new Date().toISOString(),
        participantCount: 0,
      };

      // Dispatch create room action
      const result = await dispatch(createRoom(roomPayload)).unwrap();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Room created successfully! 🎉", {
        duration: 5000,
        icon: "🚀",
      });

      // Redirect to the new room
      navigate(`/room/${result.roomId}`);
    } catch (error) {
      toast.error(error.message || "Failed to create room", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if required fields are filled
  const isFormValid = () => {
    return (
      roomData.name.trim() &&
      roomData.language &&
      roomData.topic &&
      !(roomData.type === "private" && !roomData.password)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/rooms")}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back to Rooms
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Room
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create your language practice room
          </p>
          
          {/* Required Fields Indicator */}
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <span className="text-red-500">*</span>
            <span className="text-gray-600">Required fields</span>
            {isFormValid() ? (
              <Badge variant="success" className="flex items-center">
                <FaCheckCircle className="mr-1" /> All required fields complete
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center">
                <FaExclamationCircle className="mr-1" /> Required fields incomplete
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaMicrophone className="text-primary-600 mr-2" />
                  Basic Information <span className="text-red-500 ml-1">*</span>
                </h2>

                <div className="space-y-4">
                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={roomData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., English Conversation Practice"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        validationErrors.name 
                          ? "border-red-500 bg-red-50" 
                          : "border-gray-300"
                      }`}
                      maxLength={100}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationCircle className="mr-1" /> {validationErrors.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {roomData.name.length}/100 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={roomData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what your room is about..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Language and Topic */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="language"
                        value={roomData.language}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors.language 
                            ? "border-red-500 bg-red-50" 
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Language</option>
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.language && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.language}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="topic"
                        value={roomData.topic}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          validationErrors.topic 
                            ? "border-red-500 bg-red-50" 
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Topic</option>
                        {topics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                      {validationErrors.topic && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.topic}</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                        placeholder="Add tags (press Enter)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="secondary"
                        className="px-4"
                      >
                        <FaPlus />
                      </Button>
                    </div>

                    {/* Tags Display */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roomData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="primary"
                          className="flex items-center space-x-1 pl-3 pr-2 py-1"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <FaTrash size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Room Settings Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUsers className="text-primary-600 mr-2" />
                  Room Settings
                </h2>

                <div className="space-y-4">
                  {/* Room Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          roomData.type === "public"
                            ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value="public"
                          checked={roomData.type === "public"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-2">
                          <FaGlobe
                            className={
                              roomData.type === "public"
                                ? "text-primary-600"
                                : "text-gray-400"
                            }
                          />
                          <div>
                            <p className="font-medium">Public Room</p>
                            <p className="text-xs text-gray-500">
                              Anyone can join
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          roomData.type === "private"
                            ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value="private"
                          checked={roomData.type === "private"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-2">
                          <FaLock
                            className={
                              roomData.type === "private"
                                ? "text-primary-600"
                                : "text-gray-400"
                            }
                          />
                          <div>
                            <p className="font-medium">Private Room</p>
                            <p className="text-xs text-gray-500">
                              Password protected
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Password (for private rooms) */}
                  <AnimatePresence>
                    {roomData.type === "private" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={roomData.password}
                            onChange={handleInputChange}
                            placeholder="Enter room password"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                              validationErrors.password 
                                ? "border-red-500 bg-red-50" 
                                : "border-gray-300"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {validationErrors.password && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Participants: {roomData.maxParticipants}
                    </label>
                    <input
                      type="range"
                      name="maxParticipants"
                      min="2"
                      max="50"
                      value={roomData.maxParticipants}
                      onChange={handleInputChange}
                      className="w-full accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>2</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Advanced Settings Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaVideo className="text-primary-600 mr-2" />
                  Advanced Settings
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { setting: "isVideoEnabled", icon: FaVideo, label: "Enable Video" },
                    { setting: "isAudioEnabled", icon: FaVolumeUp, label: "Enable Audio" },
                    { setting: "requireApproval", icon: FaUsers, label: "Require Approval" },
                    { setting: "allowScreenShare", icon: FaVideo, label: "Allow Screen Share" },
                    { setting: "allowRecording", icon: FaVideo, label: "Allow Recording" },
                    { setting: "allowChat", icon: FaUsers, label: "Enable Chat" },
                  ].map(({ setting, icon: Icon, label }) => (
                    <label
                      key={setting}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="text-gray-600" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={roomData.settings[setting]}
                        onChange={(e) => handleSettingChange(setting, e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Room Preview Card */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Room Preview</h2>

                  <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant={roomData.type === "public" ? "success" : "warning"}
                      >
                        {roomData.type === "public" ? "🔓 Public" : "🔒 Private"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        <FaUsers className="inline mr-1" />
                        {roomData.maxParticipants} max
                      </span>
                    </div>

                    <h3 className="font-bold text-lg mb-1">
                      {roomData.name || "Your Room Name"}
                    </h3>

                    {roomData.language && (
                      <p className="text-sm text-gray-600 mb-2">
                        {languages.find((l) => l.code === roomData.language)?.flag}{" "}
                        {languages.find((l) => l.code === roomData.language)?.name}
                        {" · "}
                        {roomData.topic || "Topic"}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2">
                      {roomData.description || "No description yet"}
                    </p>

                    {/* Tags Preview */}
                    {roomData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {roomData.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} size="sm" variant="light">
                            #{tag}
                          </Badge>
                        ))}
                        {roomData.tags.length > 3 && (
                          <Badge size="sm" variant="light">
                            +{roomData.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">Video:</span>
                      <span className="font-medium">
                        {roomData.settings.isVideoEnabled ? "✅ Enabled" : "❌ Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">Audio:</span>
                      <span className="font-medium">
                        {roomData.settings.isAudioEnabled ? "✅ Enabled" : "❌ Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">Approval:</span>
                      <span className="font-medium">
                        {roomData.settings.requireApproval ? "✅ Required" : "❌ Not Required"}
                      </span>
                    </div>
                  </div>

                  {/* MAIN CREATE BUTTON - Always Visible */}
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Creating Room...
                        </>
                      ) : (
                        <>
                          <FaRocket className="mr-2 text-xl" />
                          🚀 CREATE ROOM NOW
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigate("/rooms")}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Form Status */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      {!isFormValid() ? (
                        <span className="flex items-center text-amber-600">
                          <FaExclamationCircle className="mr-1" />
                          Please fill in all required fields
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          Ready to create your room!
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Info Note */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By clicking Create Room, you agree to our Community Guidelines
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </form>

        {/* Floating Create Button for Mobile - Always Visible */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FaRocket className="mr-2" />
                CREATE ROOM
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCreationSection;