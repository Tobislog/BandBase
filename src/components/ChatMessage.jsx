import { useAuth } from "../context/AuthProvider"

export default function ChatMessage ({message}) {

    return (
        <div className=" border border-brand rounded bg-brand/30 p-1">
            <div>
                {message.userId}
            </div>
            <div>
                {message.content}
            </div>
        </div>
    )
}
