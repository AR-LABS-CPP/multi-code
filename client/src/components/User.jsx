import Avatar from "react-avatar"

const User = ({ username }) => {
    return (
        <div className="text-white flex items-center space-x-3">
            <Avatar name={username} size="35" className="rounded-md" />
            <p>{username}</p>
        </div>
    )
}

export default User