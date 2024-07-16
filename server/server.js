const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const diffMatchPatch = require("diff-match-patch")
const SOCKET_EVENTS = require("./constants/SocketEvents")

const PORT = process.env.PORT || 3050

const app = express()
const dmp = new diffMatchPatch()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app)
const socketIO = new Server(server, {
    cors: {
        origin: "*"
    }
})

const userMap = {}
const projectData = {}

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

        if(!projectData[projectId]) {
            projectData[projectId] = ""
        }

        const clients = getAllConnectedClients(projectId)

        clients.forEach(({ socketId }) => {
            socketIO.to(socketId).emit("joined", {
                clients,
                username,
                socketId: socket.id,
                code: projectData[projectId]
            })
        })
    })

    socket.on(SOCKET_EVENTS.CODE_CHANGED, ({ projectId, patch, sender }) => {
        const patches = dmp.patch_fromText(patch)
        const newCode = dmp.patch_apply(patches, projectData[projectId])[0]
        projectData[projectId] = newCode || ""

        console.log(projectData[projectId])

        socketIO.to(projectId).emit(SOCKET_EVENTS.CODE_CHANGED, { patch, sender })
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