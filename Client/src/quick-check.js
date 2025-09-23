/**
 * Quick Server Check
 * Simple test to verify servers are running and responding
 */

const testUrls = [
  'http://127.0.0.1:8000/list-apps',
  'http://127.0.0.1:8001/health'
];

async function quickTest() {
  console.log('🔍 Quick Server Check\n');
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      console.log(`✅ ${url} - Status: ${response.status}`);
      console.log(`   Response: ${data.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}\n`);
    }
  }
}

quickTest();