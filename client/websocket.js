import WebSocket from 'ws'
const P2P = 'ws://localhost:6001'
const ws = new WebSocket(P2P);

ws.on('connect', () => {
  console.log('fuck yea I connected');
})

ws.on('message', (message) => {
  console.log('message received', message.data);
})
