import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSelector = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', speakers: '1.5B+' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', speakers: '580M+' },
    { code: 'fr', name: 'French', flag: '🇫🇷', speakers: '300M+' },
    { code: 'de', name: 'German', flag: '🇩🇪', speakers: '130M+' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', speakers: '85M+' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', speakers: '260M+' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', speakers: '150M+' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', speakers: '125M+' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', speakers: '80M+' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', speakers: '1.1B+' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', speakers: '420M+' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', speakers: '600M+' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', speakers: '30M+' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', speakers: '13M+' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', speakers: '5.3M+' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', speakers: '5.6M+' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', speakers: '5.4M+' },
    { code: 'el', name: 'Greek', flag: '🇬🇷', speakers: '13M+' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', speakers: '80M+' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', speakers: '40M+' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿', speakers: '10M+' },
    { code: 'th', name: 'Thai', flag: '🇹🇭', speakers: '60M+' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', speakers: '95M+' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', speakers: '43M+' }
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

  const selectedLanguage = languages.find(lang => lang.code === value);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all group"
      >
        <div className="flex items-center space-x-3">
          <FaGlobe className={`text-lg ${selectedLanguage ? 'text-primary-600' : 'text-gray-400'} group-hover:text-primary-600 transition-colors`} />
          {selectedLanguage ? (
            <div className="flex items-center space-x-2">
              <span className="text-xl">{selectedLanguage.flag}</span>
              <span className="font-medium text-gray-900">{selectedLanguage.name}</span>
              <span className="text-xs text-gray-500">({selectedLanguage.code.toUpperCase()})</span>
            </div>
          ) : (
            <span className="text-gray-500">Select a language</span>
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
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Languages List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => {
                      onChange(language.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors ${
                      value === language.code ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{language.name}</p>
                        <p className="text-xs text-gray-500">
                          {language.code.toUpperCase()} · {language.speakers} speakers
                        </p>
                      </div>
                    </div>
                    {value === language.code && (
                      <span className="text-primary-600 text-sm font-medium">Selected</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500 mb-2">No languages found</p>
                  <p className="text-sm text-gray-400">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Quick Select Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {filteredLanguages.length} languages available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden input for form submission */}
      <input type="hidden" name="language" value={value || ''} />
    </div>
  );
};

export default LanguageSelector;