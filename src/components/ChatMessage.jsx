import { useChannels } from "../context/ChannelProvider"
import { useAuth } from "../context/AuthProvider";

export default function ChatMessage ({message}) {
    const {userCache} = useChannels();
    const { user } = useAuth();
    
    const authorName = userCache[message.userId] || "Loading...";
    const bgColor = (String(user.id) === String(message.userId)) ? "bg-brand/30 border-brand self-end" : "bg-line/30 border-line self-start"
    return (
        <div className={`border rounded-xl p-1.5 ${bgColor}`}>
            <div className="font-semibold text-xs">
                {authorName}
            </div>
            <div>
                {message.content}
            </div>
        </div>
    )
}
