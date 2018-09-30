import io from 'socket.io-client'
const P2P = 'http://localhost:6001'
const socket = io(P2P)

socket.on('connect', () => {
  console.log('Connected to node broadcasts!')
})

export default socket
