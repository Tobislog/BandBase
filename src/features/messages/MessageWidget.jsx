import { useRef, useState, useEffect } from "react";
import { SendHorizonal } from "lucide-react";

import BasicButton from "../../components/BasicButton";
import { useChannels } from "../../context/ChannelProvider"
import ChatMessage from "../../components/ChatMessage"


export default function MessageWidget({ className = "", onError }) {
    const { messages, messagesLoading, activeChannelId, sendMessage } = useChannels();
    const [messageContent, setMessageContent] = useState("");
    const containerRef = useRef(null);

    const handleInputChange = (e) => {
        setMessageContent(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage(e);
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!activeChannelId) return;
        if(!messageContent.trim()) return;

        try {
            await sendMessage(activeChannelId, messageContent);
            setMessageContent('');
        } catch (err) {
            onError(err.message || 'Nachricht konnte nicht gesendet werden.');
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        };
    }

    return (
        <div className={`p-2 flex flex-col justify-between ${className}`}>
            <div ref={containerRef} className="flex flex-col gap-2 bg-surface-accent border border-line rounded p-2 mb-4 max-h-100 overflow-auto">
            {messagesLoading && messages.length === 0 ? (
                <p className="text-sm text-copy/60">Lade Nachrichten...</p>
            ) : ( messages.length > 0 ? (
                    messages.map((m) => (
                        <ChatMessage key={m.id} message={m}/>
                    ))
                ) : (
                    <div className="font-light">Keine Nachrichten vorhanden, schreibe die erste!</div>
                )
            )}
            </div>
            <div className="flex flex-row gap-1 items-center justify-between">
                <input 
                    type="text" 
                    value={messageContent} 
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Nachricht schreiben..."
                    className="p-1 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand w-full"
                />
                <BasicButton 
                    icon={<SendHorizonal />} 
                    onClick={handleSendMessage}
                    disabled={messagesLoading || !messageContent.trim()}
                />
            </div>
        </div>
    )
}

