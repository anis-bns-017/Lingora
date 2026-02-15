import axios from 'axios';

const testAPI = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  console.log('🔍 Testing connection to:', API_URL);
  
  try {
    // Test health endpoint (if you have one)
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`, {
      timeout: 5000
    });
    console.log('✅ Server is reachable:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Cannot reach server:', {
      message: error.message,
      code: error.code,
      url: API_URL
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.log('\n📋 Troubleshooting steps:');
      console.log('1. Make sure backend server is running: cd lingora-backend && npm run dev');
      console.log('2. Check if backend is running on port 5000');
      console.log('3. Verify CORS is enabled on backend');
      console.log('4. Try accessing http://localhost:5000/health in your browser');
    }
    
    return false;
  }
};

// Run the test
testAPI();