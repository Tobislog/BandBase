import { useChannels } from "../context/ChannelProvider"

export default function ChatMessage ({message}) {
    const {userCache} = useChannels();
    
    const authorName = userCache[message.userId] || "Loading...";
    return (
        <div className=" border border-brand rounded bg-brand/30 p-1">
            <div>
                {authorName}
            </div>
            <div>
                {message.content}
            </div>
        </div>
    )
}
