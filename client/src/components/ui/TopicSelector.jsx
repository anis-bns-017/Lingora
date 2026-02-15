import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaTag, FaMicrophone, FaBriefcase, FaGraduationCap, FaComments, FaBook, FaChalkboardTeacher, FaUsers, FaGlobe, FaTheaterMasks, FaLaptop, FaMusic, FaFilm, FaHeart, FaUtensils, FaPlane, FaFutbol, FaPencilAlt, FaFlask, FaGavel, FaChartLine, FaHandsHelping } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TopicSelector = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dropdownRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: FaTag },
    { id: 'conversation', name: 'Conversation', icon: FaComments },
    { id: 'business', name: 'Business', icon: FaBriefcase },
    { id: 'academic', name: 'Academic', icon: FaGraduationCap },
    { id: 'culture', name: 'Culture', icon: FaGlobe },
    { id: 'entertainment', name: 'Entertainment', icon: FaFilm },
    { id: 'lifestyle', name: 'Lifestyle', icon: FaHeart },
    { id: 'professional', name: 'Professional', icon: FaChartLine }
  ];

  const topics = [
    // Conversation
    { id: 'casual-talk', name: 'Casual Conversation', category: 'conversation', icon: FaComments, popularity: 95, description: 'Everyday conversations on various topics' },
    { id: 'small-talk', name: 'Small Talk', category: 'conversation', icon: FaComments, popularity: 90, description: 'Learn to chat about everyday situations' },
    { id: 'debate-club', name: 'Debate Club', category: 'conversation', icon: FaGavel, popularity: 75, description: 'Practice arguing and defending opinions' },
    { id: 'storytelling', name: 'Storytelling', category: 'conversation', icon: FaBook, popularity: 80, description: 'Share and listen to stories' },
    
    // Business
    { id: 'business-english', name: 'Business English', category: 'business', icon: FaBriefcase, popularity: 92, description: 'Professional language for workplace' },
    { id: 'interview-prep', name: 'Interview Preparation', category: 'business', icon: FaUsers, popularity: 88, description: 'Practice job interviews' },
    { id: 'negotiation', name: 'Negotiation Skills', category: 'business', icon: FaGavel, popularity: 82, description: 'Learn to negotiate effectively' },
    { id: 'presentation', name: 'Presentations', category: 'business', icon: FaChalkboardTeacher, popularity: 85, description: 'Master public speaking' },
    { id: 'meetings', name: 'Business Meetings', category: 'business', icon: FaUsers, popularity: 87, description: 'Participate in meetings confidently' },
    { id: 'email-writing', name: 'Email Writing', category: 'business', icon: FaPencilAlt, popularity: 84, description: 'Professional email etiquette' },
    
    // Academic
    { id: 'academic-writing', name: 'Academic Writing', category: 'academic', icon: FaPencilAlt, popularity: 78, description: 'Essays, papers, and research' },
    { id: 'test-prep', name: 'Test Preparation', category: 'academic', icon: FaGraduationCap, popularity: 86, description: 'IELTS, TOEFL, Cambridge prep' },
    { id: 'grammar', name: 'Grammar Practice', category: 'academic', icon: FaBook, popularity: 89, description: 'Master grammar rules' },
    { id: 'pronunciation', name: 'Pronunciation', category: 'academic', icon: FaMicrophone, popularity: 94, description: 'Perfect your accent' },
    { id: 'vocabulary', name: 'Vocabulary Building', category: 'academic', icon: FaBook, popularity: 91, description: 'Expand your word bank' },
    { id: 'science-talk', name: 'Science Discussions', category: 'academic', icon: FaFlask, popularity: 65, description: 'Discuss scientific topics' },
    
    // Culture
    { id: 'cultural-exchange', name: 'Cultural Exchange', category: 'culture', icon: FaGlobe, popularity: 88, description: 'Share and learn about cultures' },
    { id: 'travel-talk', name: 'Travel Talk', category: 'culture', icon: FaPlane, popularity: 86, description: 'Discuss travel experiences' },
    { id: 'food-culture', name: 'Food & Cuisine', category: 'culture', icon: FaUtensils, popularity: 83, description: 'Talk about food and cooking' },
    { id: 'music-talk', name: 'Music Discussion', category: 'entertainment', icon: FaMusic, popularity: 79, description: 'Discuss music and artists' },
    { id: 'movie-club', name: 'Movie Club', category: 'entertainment', icon: FaFilm, popularity: 81, description: 'Talk about films and series' },
    { id: 'book-club', name: 'Book Club', category: 'entertainment', icon: FaBook, popularity: 77, description: 'Discuss literature' },
    { id: 'sports-talk', name: 'Sports Discussion', category: 'lifestyle', icon: FaFutbol, popularity: 76, description: 'Talk about sports' },
    
    // Professional
    { id: 'tech-talk', name: 'Tech Talk', category: 'professional', icon: FaLaptop, popularity: 84, description: 'Discuss technology topics' },
    { id: 'marketing', name: 'Marketing & Sales', category: 'professional', icon: FaChartLine, popularity: 79, description: 'Marketing vocabulary and concepts' },
    { id: 'healthcare', name: 'Healthcare', category: 'professional', icon: FaHeart, popularity: 72, description: 'Medical terminology' },
    { id: 'legal-english', name: 'Legal English', category: 'professional', icon: FaGavel, popularity: 68, description: 'Legal terminology' },
    { id: 'finance', name: 'Finance & Economics', category: 'professional', icon: FaChartLine, popularity: 75, description: 'Financial discussions' },
    
    // Lifestyle
    { id: 'hobbies', name: 'Hobbies & Interests', category: 'lifestyle', icon: FaHeart, popularity: 82, description: 'Share your hobbies' },
    { id: 'wellness', name: 'Health & Wellness', category: 'lifestyle', icon: FaHeart, popularity: 78, description: 'Discuss healthy living' },
    { id: 'parenting', name: 'Parenting Talk', category: 'lifestyle', icon: FaUsers, popularity: 70, description: 'Parenting discussions' },
    { id: 'relationships', name: 'Relationships', category: 'lifestyle', icon: FaHeart, popularity: 73, description: 'Talk about relationships' },
    { id: 'philosophy', name: 'Philosophy', category: 'conversation', icon: FaBook, popularity: 69, description: 'Deep philosophical discussions' },
    { id: 'news-discussion', name: 'Current Events', category: 'conversation', icon: FaGlobe, popularity: 85, description: 'Discuss latest news' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTopic = topics.find(topic => topic.id === value);

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : FaTag;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all group"
      >
        <div className="flex items-center space-x-3">
          <FaTag className={`text-lg ${selectedTopic ? 'text-primary-600' : 'text-gray-400'} group-hover:text-primary-600 transition-colors`} />
          {selectedTopic ? (
            <div className="flex items-center space-x-2">
              {selectedTopic.icon && <selectedTopic.icon className="text-primary-600" />}
              <span className="font-medium text-gray-900">{selectedTopic.name}</span>
            </div>
          ) : (
            <span className="text-gray-500">Select a topic</span>
          )}
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex overflow-x-auto space-x-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-xs" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Topics List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => {
                  const CategoryIcon = getCategoryIcon(topic.category);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        onChange(topic.id);
                        setIsOpen(false);
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-primary-50 transition-colors group ${
                        value === topic.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          value === topic.id ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-primary-100'
                        }`}>
                          {topic.icon ? <topic.icon className={value === topic.id ? 'text-primary-600' : 'text-gray-600'} /> : <CategoryIcon className={value === topic.id ? 'text-primary-600' : 'text-gray-600'} />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{topic.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">{topic.popularity}%</span>
                              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${topic.popularity}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {categories.find(c => c.id === topic.category)?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      {value === topic.id && (
                        <span className="text-primary-600 text-sm font-medium ml-2">Selected</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500 mb-2">No topics found</p>
                  <p className="text-sm text-gray-400">Try a different search term or category</p>
                </div>
              )}
            </div>

            {/* Quick Stats Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {filteredTopics.length} topics available
              </p>
              {selectedTopic && (
                <button
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear selection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden input for form submission */}
      <input type="hidden" name="topic" value={value || ''} />
    </div>
  );
};

export default TopicSelector;