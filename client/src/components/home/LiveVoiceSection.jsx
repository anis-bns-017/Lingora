import React from 'react';
import { 
  FaMicrophone, FaMicrophoneSlash, FaHeadphones, 
  FaVolumeUp, FaUsers, FaSignOutAlt, FaCheckCircle,
  FaWaveSquare, FaAdjust, FaMicrophoneAlt
} from 'react-icons/fa';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const LiveVoiceSection = () => {
  const features = [
    {
      icon: FaMicrophone,
      title: 'High-Quality Voice',
      description: 'Crystal clear audio with noise suppression for distraction-free conversations',
      badges: ['Opus Codec', 'Echo Cancellation']
    },
    {
      icon: FaMicrophoneSlash,
      title: 'Mute/Deafen Controls',
      description: 'Full control over your audio with mute, deafen, and individual volume controls',
      controls: ['Mute microphone', 'Deafen speakers', 'Volume slider', 'Test microphone']
    },
    {
      icon: FaHeadphones,
      title: 'Speaking Detection',
      description: 'Visual indicators show who\'s currently speaking for natural conversation flow',
      hasAnimation: true
    }
  ];

  return (
    <section className="bg-white rounded-3xl p-12 shadow-xl">
      <div className="text-center mb-12">
        <Badge variant="primary" className="mb-4 inline-block">Real-time Communication</Badge>
        <h2 className="text-4xl font-bold mb-4">
          Experience <span className="text-primary-600">Live Voice Chat</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Crystal clear voice communication with real-time features designed for language learning
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Voice Features */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <VoiceFeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Voice Controls Interface Preview */}
        <VoiceControlsPreview />
      </div>

      {/* Additional Voice Features */}
      <VoiceFeatureGrid />
    </section>
  );
};

const VoiceFeatureCard = ({ feature }) => {
  const Icon = feature.icon;
  
  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex items-start space-x-4">
        <div className="bg-primary-100 text-primary-600 rounded-lg p-3">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
          
          {feature.badges && (
            <div className="mt-3 flex items-center space-x-2">
              {feature.badges.map((badge, i) => (
                <Badge key={i} variant="success">{badge}</Badge>
              ))}
            </div>
          )}
          
          {feature.controls && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {feature.controls.map((control, i) => (
                <div key={i} className="flex items-center text-sm">
                  <FaCheckCircle className="text-green-500 mr-1" size={14} />
                  {control}
                </div>
              ))}
            </div>
          )}
          
          {feature.hasAnimation && (
            <div className="mt-3 flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-${6 + i} bg-primary-500 rounded-full animate-pulse`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const VoiceControlsPreview = () => (
  <div className="bg-gray-900 rounded-2xl p-6 text-white">
    <h3 className="text-lg font-semibold mb-4">Voice Controls</h3>
    
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="text-center">
          <div className="relative">
            <Avatar src={`https://i.pravatar.cc/150?img=${i+30}`} size="md" className="mx-auto mb-2" />
            {i === 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            )}
            {i === 2 && (
              <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-0.5">
                <FaMicrophoneSlash size={8} className="text-white" />
              </div>
            )}
          </div>
          <p className="text-xs truncate">User {i}</p>
          {i === 1 && (
            <div className="flex justify-center space-x-0.5 mt-1">
              <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      ))}
    </div>

    <VoiceControlBar />
    <VolumeControl />
  </div>
);

const VoiceControlBar = () => (
  <div className="bg-gray-800 rounded-lg p-4 flex justify-center space-x-4">
    <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition group">
      <FaMicrophone className="text-white group-hover:scale-110 transition" size={20} />
    </button>
    <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
      <FaHeadphones className="text-white" size={20} />
    </button>
    <button className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition">
      <FaSignOutAlt className="text-white" size={20} />
    </button>
    <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition relative">
      <FaUsers className="text-white" size={20} />
      <span className="absolute -top-1 -right-1 bg-green-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
        6
      </span>
    </button>
  </div>
);

const VolumeControl = () => (
  <div className="mt-4 flex items-center space-x-3">
    <FaVolumeUp className="text-gray-400" size={18} />
    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div className="w-3/4 h-full bg-primary-500 rounded-full"></div>
    </div>
    <span className="text-sm text-gray-400">75%</span>
  </div>
);

const VoiceFeatureGrid = () => {
  const features = [
    { icon: FaWaveSquare, title: 'Voice Activity', desc: 'Automatic voice detection' },
    { icon: FaAdjust, title: 'Individual Volume', desc: 'Adjust per participant' },
    { icon: FaMicrophoneAlt, title: 'Push to Talk', desc: 'Optional key binding' }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-8">
      {features.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="text-center p-4">
            <div className="bg-primary-100 text-primary-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Icon size={20} />
            </div>
            <h4 className="font-medium mb-1">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        );
      })}
    </div>
  );
};

export default LiveVoiceSection;