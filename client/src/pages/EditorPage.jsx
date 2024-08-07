import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import Codemirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { dracula } from "@uiw/codemirror-theme-dracula"
import User from "../components/User"
import Directory from "../components/Directory"
import socket from "../utils/socket"
import SOCKET_EVENTS from "../constants/SocketEvents"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import diff_match_patch from "diff-match-patch"

const EditorPage = () => {
    const navigator = useNavigate()
    const location = useLocation()
    const { projectId } = useParams()
    const [code, setCode] = useState("")
    const [clients, setClients] = useState([])
    const dmp = useRef(new diff_match_patch())
    const latestCode = useRef("")

    const dummyFilesAndFolders = {
        "name": "Dummy",
        "type": "folder",
        "items": [
            {
                "name": ".gitignore",
                "type": "file"
            },
            {
                "name": "index.html",
                "type": "file"
            },
            {
                "name": "package.json",
                "type": "file"
            },
            {
                "name": "src",
                "type": "folder",
                "items": [
                    {
                        "name": "App.css",
                        "type": "file"
                    },
                    {
                        "name": "App.jsx",
                        "type": "file"
                    }
                ]
            },
            {
                "name": "pages",
                "type": "folder",
                "items": [
                    {
                        "name": "Home.jsx",
                        "type": "file"
                    },
                    {
                        "name": "About.jsx",
                        "type": "file"
                    }
                ]
            }
        ]
    }

    const onChange = useCallback((value, update) => {
        const patch = dmp.current.patch_make(latestCode.current, value)
        const patchText = dmp.current.patch_toText(patch)
        
        latestCode.current = value

        socket.emit(SOCKET_EVENTS.CODE_CHANGED, {
            projectId,
            patch: patchText,
            sender: socket.id
        })
    }, [])

    const handleSocketError = (err) => {
        console.debug("Socket error: ", err)
        toast.error("Connection failed, please try again")
        navigator("/")
    }

    const handleConnFailed = (err) => {
        console.debug("Socket error: ", err)
        toast.error("Connection failed, please try again")
        navigator("/")
    }

    const leaveEditor = () => {
        if(socket) {
            socket.disconnect()
            socket.off(SOCKET_EVENTS.JOINED)
            socket.off(SOCKET_EVENTS.DISCONNECTED)
            socket.off(SOCKET_EVENTS.CODE_CHANGED)
        }

        navigator("/")
    }

    useEffect(() => {
        socket.connect()

        socket.on("connect", () => {
            console.debug("Connected with the server", socket.id)
        })

        socket.on("connect_error", (err) => handleSocketError(err))
        socket.on("connect_failed", (err) => handleConnFailed(err))

        socket.emit(SOCKET_EVENTS.JOIN, {
            projectId: projectId,
            username: location.state.username ?? "Default"
        })

        socket.on(SOCKET_EVENTS.JOINED, ({ clients, username, socketId, code }) => {
            if(username !== location.state.username) {
                toast.success(`${username} has joined the project`)
            }
            
            latestCode.current = code
            setCode(code)
            setClients(clients)
        })

        socket.on(SOCKET_EVENTS.DISCONNECTED, ({ socketId, username }) => {
            toast.success(`${username} has left the project`)
            setClients(prevClients => {
                return prevClients.filter(client => client.socketId !== socketId)
            })
        })

        socket.on(SOCKET_EVENTS.CODE_CHANGED, ({ patch, sender }) => {
            // Do not update if the changes were sent by the same user
            if(sender == socket.id) {
                return
            }

            if(patch != null) {
                const patches = dmp.current.patch_fromText(patch)
                const newCode = dmp.current.patch_apply(patches, latestCode.current)[0]
                
                latestCode.current = newCode
                setCode(newCode)
            }
        })

        return () => {
            socket.disconnect()
            socket.off(SOCKET_EVENTS.JOINED)
            socket.off(SOCKET_EVENTS.DISCONNECTED)
            socket.off(SOCKET_EVENTS.CODE_CHANGED)
        }
    }, [])

    if(!location.state) {
        return <Navigate to={"/"} />
    }

    return (
        <div className="min-h-screen flex">
            {/* Aside */}
            <div className="bg-slate-900 border-r-[1px] border-gray-400 w-72 flex flex-col p-5">
                <p className="text-white font-bold border-b-[1px]">Explorer</p>
                <div className="py-3 text-white">
                    <Directory files={dummyFilesAndFolders} />
                </div>
            </div>

            {/* Code Editor */}
            <Codemirror
                className="flex-1"
                value={code}
                extensions={[javascript({ jsx: true })]}
                onChange={onChange}
                height="100vh"
                theme={dracula}
            />

            <div className="bg-slate-900 border-l-[1px] border-gray-400 w-72 flex flex-col items-center">
                <p className="text-white text-3xl font-bold py-10">&#123;&nbsp;Multi Code&nbsp;&#125;</p>
                <span className="border-b-[1px] border-gray-300 w-full"></span>
                <div className="flex-1 py-4 px-7 w-full flex flex-col space-y-4">
                    {
                        clients.map(client => (
                            <User username={client.username} key={client.socketId} />
                        ))
                    }
                </div>
                <div className="flex flex-col space-y-3 w-full py-4">
                    <button className="text-white bg-blue-800 hover:bg-blue-700 mx-4 py-2 rounded" onClick={() => leaveEditor()}>Leave</button>
                    <p className="text-white text-center mx-4 py-2 rounded border-[1px]">Project ID: {projectId}</p>
                </div>
            </div>
        </div>
    )
}

export default EditorPage