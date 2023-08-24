import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { v4 as uuid } from "uuid"

const ConnectPage = () => {
    const navigate = useNavigate()

    const [formValues, setFormValues] = useState({
        projectId: "",
        projectName: "",
        userName: ""
    })

    const generateProjectId = () => {
        setFormValues(prevValues => ({
            ...prevValues,
            projectId: uuid()
        }))
    }

    const joinProject = () => {
        navigate(`/editor/${formValues.projectId}`, {
            state: {
                username: formValues.userName,
            }
        })
    }

    return (
        <div className="bg-slate-900 min-h-screen flex justify-center items-center">
            <div className="bg-slate-800 border-[1px] border-gray-400 text-white flex flex-col px-7 py-10 space-y-7">
                <div className="flex flex-col">
                    <label htmlFor="projectId" className="text-lg">Project Id</label>
                    <input
                        type="text"
                        name="projectID"
                        id="projectId"
                        value={formValues.projectId}
                        onChange={(evt) => setFormValues(prevValues => ({ ...prevValues, projectId: evt.target.value }))}
                        className="text-black w-96 p-2 rounded outline-none" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="projectName" className="text-lg">Project Name</label>
                    <input
                        type="text"
                        name="projectName"
                        id="projectName"
                        value={formValues.projectName}
                        onChange={(evt) => setFormValues(prevValues => ({ ...prevValues, projectName: evt.target.value }))}
                        className="text-black w-96 p-2 rounded outline-none" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="username" className="text-lg">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formValues.userName}
                        onChange={(evt) => setFormValues(prevValues => ({ ...prevValues, userName: evt.target.value }))}
                        className="text-black w-96 p-2 rounded outline-none" />
                </div>

                <div className="flex flex-col space-y-3">
                    <button className="bg-blue-800 py-2 rounded border-[1px] border-gray-500 hover:bg-blue-700" onClick={joinProject}>Join Project</button>
                    <button className="text-center font-bold underline" onClick={() => generateProjectId()}>Create a new project</button>
                </div>
            </div>
        </div>
    )
}

export default ConnectPage