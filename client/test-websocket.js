const io = require('socket.io-client');

// Test WebSocket connection to audit namespace
const socket = io('http://localhost:3001/audit', {
  auth: { token: 'dev-token-placeholder' },
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true,
});

console.log('🔌 Attempting to connect to WebSocket...');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket!');
  console.log('📡 Socket ID:', socket.id);

  // Subscribe to audit events
  socket.emit('subscribe', {
    eventTypes: ['*'],
    severities: ['high', 'critical'],
    minSeverity: 'medium',
  });

  console.log('📝 Subscribed to audit events');
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from WebSocket:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🚫 Connection error:', error.message);
});

socket.on('error', (error) => {
  console.error('🚫 WebSocket error:', error);
});

socket.on('connected', (data) => {
  console.log('🎉 Server welcome message:', data);
});

socket.on('audit_event', (data) => {
  console.log('📊 Received audit event:', data);
});

socket.on('metrics_update', (data) => {
  console.log('📈 Received metrics update:', data);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

// Test ping every 10 seconds
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
    console.log('🏓 Ping sent');
  }
}, 10000);

// Keep the script running
setTimeout(() => {
  console.log('⏰ Test timeout - disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 30000);