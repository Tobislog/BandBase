import { useAuth } from "../context/AuthProvider";

export default function ChatMessage ({ message }) {
    const { user } = useAuth();
    
    const author = message.author;
    const authorName = author ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Unbekannt' : 'Unbekannt';
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
    );
}
