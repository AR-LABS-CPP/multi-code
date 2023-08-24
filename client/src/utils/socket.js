import { io } from "socket.io-client"

const URL = "http://localhost:3050"

const socket = io(URL, {
    "force new connection": true,
    reconnectionAttempts: 10,
    timeout: 10000,
    autoConnect: false,
    transports: ["websocket"]
})

export default socket