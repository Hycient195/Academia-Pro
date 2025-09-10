const io = require('socket.io-client');

// Test WebSocket connection and real-time audit events
async function testWebSocketConnection() {
  console.log('🔌 Testing WebSocket connection to audit namespace...');

  const socket = io('http://localhost:3001/audit', {
    auth: {
      token: 'dev-token-123' // Using development token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    console.log('📡 Socket ID:', socket.id);

    // Subscribe to audit events
    socket.emit('subscribe', {
      eventTypes: ['*'],
      severities: ['high', 'critical'],
      minSeverity: 'medium'
    });

    console.log('📝 Subscribed to audit events');
  });

  socket.on('connected', (data) => {
    console.log('🎉 Server confirmed connection:', data);
  });

  socket.on('audit_event', (data) => {
    console.log('🔥 Received audit event:', JSON.stringify(data, null, 2));
  });

  socket.on('metrics_update', (data) => {
    console.log('📊 Received metrics update:', JSON.stringify(data, null, 2));
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from WebSocket server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  // Test ping/pong
  setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
    }
  }, 10000);

  // Keep the connection alive for testing
  setTimeout(() => {
    console.log('🛑 Closing test connection...');
    socket.disconnect();
    process.exit(0);
  }, 60000); // 1 minute
}

// Run the test
testWebSocketConnection().catch(console.error);