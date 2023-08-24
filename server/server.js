const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const SOCKET_EVENTS = require("./constants/SocketEvents")

const PORT = process.env.PORT || 3050

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app)
const socketIO = new Server(server, {
    cors: {
        origin: "*"
    }
})

const userMap = {}

const getAllConnectedClients = (projectId) => {
    return Array.from(socketIO.sockets.adapter.rooms.get(projectId) || [])
        .map(socketId => {
            return {
                socketId,
                username: userMap[socketId]
            }
        })
}

socketIO.on("connection", (socket) => {
    socket.on(SOCKET_EVENTS.JOIN, ({ projectId, username }) => {
        userMap[socket.id] = username
        socket.join(projectId)

        const clients = getAllConnectedClients(projectId)

        clients.forEach(({ socketId }) => {
            socketIO.to(socketId).emit("joined", {
                clients,
                username,
                socketId: socket.id
            })
        })
    })

    socket.on(SOCKET_EVENTS.CODE_CHANGED, ({ projectId, newCode }) => {
        socketIO.to(projectId).emit(SOCKET_EVENTS.CODE_CHANGED, { newCode })
    })

    socket.on("disconnecting", () => {
        [...socket.rooms].forEach(projectId => {
            socket.in(projectId).emit(SOCKET_EVENTS.DISCONNECTED, {
                socketId: socket.id,
                username: userMap[socket.id]
            })
        })

        delete userMap[socket.id]
        socket.leave()
    })
})

server.listen(PORT, () => console.log(`Listening on port: ${PORT}`))