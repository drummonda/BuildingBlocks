import io from 'socket.io-client'
const socket = io('http://localhost:6001')

socket.on('connect', () => {
  console.log('Connected to node broadcasts!')
})

export default socket
