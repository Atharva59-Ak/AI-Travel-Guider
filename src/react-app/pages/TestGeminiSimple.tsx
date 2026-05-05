import { GoogleGenerativeAI } from '@google/generative-ai';

// Test Gemini API connection
async function testGeminiAPI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ API Key is missing!');
    return;
  }

  try {
    console.log('🚀 Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('📡 Testing with simple text generation...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Say "Hello World" in JSON format: {"message": "Hello World"}');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Response:', text);
    console.log('✨ API is working correctly!');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

// Run the test
testGeminiAPI();
