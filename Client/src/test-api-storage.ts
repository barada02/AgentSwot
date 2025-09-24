/**
 * API and Storage Integration Test
 * Run this file separately to test ADK endpoints and MongoDB storage
 * 
 * Usage: npx tsx src/test-api-storage.ts
 */

import axios from 'axios';

// Configuration
const ADK_API_BASE = 'http://127.0.0.1:8000';
const STORAGE_API_BASE = 'http://127.0.0.1:8001';

// Test user session
const testSession = {
  userId: 'test-user-' + Date.now(),
  sessionId: 'test-session-' + Date.now(),
  appName: 'multi_tool_agent'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}🔵 ${msg}${colors.reset}`)
};

// Axios instance for ADK API
const adkApi = axios.create({
  baseURL: ADK_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Axios instance for Storage API
const storageApi = axios.create({
  baseURL: STORAGE_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Test functions
async function testAdkConnection(): Promise<boolean> {
  try {
    log.step('Testing ADK API connection...');
    const response = await adkApi.get('/list-apps');
    log.success(`ADK API connected. Available apps: ${response.data.join(', ')}`);
    return true;
  } catch (error: any) {
    log.error(`ADK API connection failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      log.warning('Make sure ADK server is running: adk web');
    }
    return false;
  }
}

async function testStorageConnection(): Promise<boolean> {
  try {
    log.step('Testing Storage API connection...');
    const response = await storageApi.get('/storage/health');
    log.success('Storage API connected successfully');
    console.log('Storage status:', response.data.status);
    return true;
  } catch (error: any) {
    log.error(`Storage API connection failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      log.warning('Make sure Storage server is running: python storage_server.py');
    }
    return false;
  }
}

async function testCreateAdkSession(): Promise<boolean> {
  try {
    log.step('Creating ADK session...');
    const response = await adkApi.post(
      `/apps/${testSession.appName}/users/${testSession.userId}/sessions/${testSession.sessionId}`
    );
    
    log.success(`ADK session created: ${response.data.id}`);
    console.log('Session details:', {
      id: response.data.id,
      appName: response.data.appName,
      userId: response.data.userId,
      lastUpdateTime: new Date(response.data.lastUpdateTime * 1000).toISOString()
    });
    return true;
  } catch (error: any) {
    log.error(`Failed to create ADK session: ${error.message}`);
    if (error.response?.status === 404) {
      log.warning('App name might be incorrect or ADK server not properly configured');
    }
    return false;
  }
}

async function testCreateStorageSession(): Promise<boolean> {
  try {
    log.step('Creating Storage session...');
    const response = await storageApi.post('/storage/sessions', {
      sessionId: testSession.sessionId,
      userId: testSession.userId,
      appName: testSession.appName,
      title: 'Test Session'
    });
    
    log.success(`Storage session created: ${response.data.sessionId}`);
    console.log('Storage session details:', response.data);
    return true;
  } catch (error: any) {
    log.error(`Failed to create storage session: ${error.message}`);
    if (error.response?.status === 400) {
      log.warning('Session might already exist or invalid data provided');
    }
    return false;
  }
}

async function testSendMessage(): Promise<boolean> {
  try {
    log.step('Sending test message to ADK...');
    const message = {
      app_name: testSession.appName,
      user_id: testSession.userId,
      session_id: testSession.sessionId,
      new_message: {
        role: 'user',
        parts: [
          { text: 'I want to launch a healthy juice product. Can you analyze it?' }
        ]
      },
      streaming: false
    };

    const response = await adkApi.post('/run', message);
    
    if (response.data && response.data.length > 0) {
      log.success('Message sent successfully. ADK responded with analysis.');
      console.log('Response preview:', {
        responseLength: response.data.length,
        firstPartLength: response.data[0]?.content?.parts?.[0]?.text?.length || 0,
        hasContent: !!response.data[0]?.content?.parts?.[0]?.text
      });
      return true;
    } else {
      log.error('ADK responded but with empty content');
      return false;
    }
  } catch (error: any) {
    log.error(`Failed to send message: ${error.message}`);
    if (error.response?.status === 404) {
      log.warning('Session not found. Make sure session was created first.');
    }
    return false;
  }
}

async function testStorageMessage(): Promise<boolean> {
  try {
    log.step('Saving test user message to storage...');
    const userMessageData = {
      sessionId: testSession.sessionId,
      messageId: `user-msg-${Date.now()}`,
      role: 'user',
      content: 'Test user message for storage',
      timestamp: Date.now()
    };

    const userResponse = await storageApi.post('/storage/messages', userMessageData);
    log.success(`User message saved to storage: ${userResponse.data._id}`);
    
    // Also test saving an agent response message
    log.step('Saving test agent response to storage...');
    const agentMessageData = {
      sessionId: testSession.sessionId,
      messageId: `agent-msg-${Date.now()}`,
      role: 'assistant',
      content: 'Test agent response message for storage',
      timestamp: Date.now() + 1000
    };

    const agentResponse = await storageApi.post('/storage/messages', agentMessageData);
    log.success(`Agent message saved to storage: ${agentResponse.data._id}`);
    
    return true;
  } catch (error: any) {
    log.error(`Failed to save message to storage: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    return false;
  }
}

async function testGetStorageStats(): Promise<boolean> {
  try {
    log.step('Getting storage statistics...');
    const response = await storageApi.get('/storage/stats');
    
    log.success('Storage stats retrieved successfully');
    console.log('Storage statistics:', {
      sessions: response.data.sessions || 0,
      messages: response.data.messages || 0,
      infographics: response.data.infographics || 0
    });
    return true;
  } catch (error: any) {
    log.error(`Failed to get storage stats: ${error.message}`);
    return false;
  }
}

async function testCompleteWorkflow(): Promise<boolean> {
  try {
    log.step('Testing complete workflow: User message → ADK processing → Storage of both messages...');
    
    // 1. Create user message
    const userMessage = 'I want to analyze a coffee shop business';
    const userMessageId = `user-${Date.now()}`;
    
    // 2. Save user message to storage first
    const userMessageData = {
      sessionId: testSession.sessionId,
      messageId: userMessageId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    
    await storageApi.post('/storage/messages', userMessageData);
    log.success('User message saved to storage');
    
    // 3. Send to ADK for processing
    const adkRequest = {
      app_name: testSession.appName,
      user_id: testSession.userId,
      session_id: testSession.sessionId,
      new_message: {
        role: 'user',
        parts: [{ text: userMessage }]
      },
      streaming: false
    };

    const adkResponse = await adkApi.post('/run', adkRequest);
    
    if (adkResponse.data && adkResponse.data.length > 0) {
      // 4. Save agent response to storage
      const agentContent = adkResponse.data[0]?.content?.parts?.[0]?.text || 'No response content';
      const agentMessageId = `agent-${Date.now()}`;
      
      const agentMessageData = {
        sessionId: testSession.sessionId,
        messageId: agentMessageId,
        role: 'assistant',
        content: agentContent,
        timestamp: Date.now() + 1000
      };
      
      await storageApi.post('/storage/messages', agentMessageData);
      log.success('Agent response saved to storage');
      
      console.log('Workflow completed:', {
        userMessageId,
        agentMessageId,
        userContentLength: userMessage.length,
        agentContentLength: agentContent.length
      });
      
      return true;
    } else {
      log.error('ADK returned empty response');
      return false;
    }
  } catch (error: any) {
    log.error(`Complete workflow test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}🧪 API & Storage Integration Test${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`\nTest Session:
  User ID: ${testSession.userId}
  Session ID: ${testSession.sessionId}
  App Name: ${testSession.appName}\n`);

  const results = {
    adkConnection: false,
    storageConnection: false,
    adkSession: false,
    storageSession: false,
    sendMessage: false,
    storageMessage: false,
    storageStats: false,
    completeWorkflow: false
  };

  // Test 1: API Connections
  console.log('\n📡 Testing API Connections...');
  results.adkConnection = await testAdkConnection();
  results.storageConnection = await testStorageConnection();

  // Test 2: Session Creation (only if connections work)
  if (results.adkConnection || results.storageConnection) {
    console.log('\n🔗 Testing Session Creation...');
    
    if (results.adkConnection) {
      results.adkSession = await testCreateAdkSession();
    }
    
    if (results.storageConnection) {
      results.storageSession = await testCreateStorageSession();
    }
  }

  // Test 3: Message Processing (only if ADK session created)
  if (results.adkSession) {
    console.log('\n💬 Testing Message Processing...');
    results.sendMessage = await testSendMessage();
  }

  // Test 4: Storage Operations (only if storage connection works)
  if (results.storageConnection) {
    console.log('\n💾 Testing Storage Operations...');
    results.storageMessage = await testStorageMessage();
    results.storageStats = await testGetStorageStats();
  }

  // Test 5: Complete Workflow (only if both ADK and storage work)
  if (results.adkSession && results.storageConnection) {
    console.log('\n🔄 Testing Complete Workflow (User → ADK → Storage)...');
    results.completeWorkflow = await testCompleteWorkflow();
  }

  // Results Summary
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}📊 Test Results Summary${colors.reset}`);
  console.log('='.repeat(60));

  const testList = [
    { name: 'ADK Connection', result: results.adkConnection },
    { name: 'Storage Connection', result: results.storageConnection },
    { name: 'ADK Session Creation', result: results.adkSession },
    { name: 'Storage Session Creation', result: results.storageSession },
    { name: 'ADK Message Processing', result: results.sendMessage },
    { name: 'Storage Message Save', result: results.storageMessage },
    { name: 'Storage Statistics', result: results.storageStats },
    { name: 'Complete Workflow Test', result: results.completeWorkflow }
  ];

  testList.forEach(test => {
    const status = test.result ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`${test.name.padEnd(25)} ${status}`);
  });

  const passCount = testList.filter(t => t.result).length;
  const totalCount = testList.length;
  
  console.log(`\nOverall: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    log.success('All tests passed! 🎉');
  } else if (passCount === 0) {
    log.error('All tests failed. Check server configurations.');
  } else {
    log.warning(`${totalCount - passCount} tests failed. Partial functionality available.`);
  }

  // Recommendations
  console.log('\n📋 Recommendations:');
  
  if (!results.adkConnection) {
    console.log('• Start ADK server: cd agentsvertex && adk web');
  }
  
  if (!results.storageConnection) {
    console.log('• Start Storage server: cd agentsvertex && python storage_server.py');
  }
  
  if (results.adkConnection && !results.adkSession) {
    console.log('• Check ADK app configuration and multi_tool_agent setup');
  }
  
  if (results.storageConnection && !results.storageSession) {
    console.log('• Check MongoDB connection and database configuration');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});

export { runTests, testSession };