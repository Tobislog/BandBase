import BasicTile from "../components/BasicTile"
import BasicButton from "../components/BasicButton"
import ChatMessage from "../components/ChatMessage"

import { useEffect, useState } from "react"
import { useBand } from "../context/BandProvider"
import { useChannels } from "../context/ChannelProvider"
import { MessageCirclePlus, MessagesCircle, SendHorizonal } from "lucide-react"

export default function Messenger () {
    const { canManage } = useBand();
    const { channels, activeChannelId, setActiveChannelId, messages} = useChannels();
    const [messageContent, setMessageContent] = useState("");

    useEffect(() => {
        if (channels && channels.length > 0 && !activeChannelId) {
            setActiveChannelId(channels[0].id);
        }
    }, [channels, activeChannelId, setActiveChannelId])

    const handleSelectChannel = (id) => {
        setActiveChannelId(id);
    }

    const handleInputChange = (e) => {
        setMessageContent(e.target.value);
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!messageContent.trim()) return;

        try {
            await sendMessage(activeChannelId, messageContent);
            setMessageContent('');
        } catch (err) {
            setError(err.message || 'Nachricht konnte nicht gesendet werden.');
        }
    };

    return (
        <div>
            <BasicTile
                title="Nachrichten"
                icon={<MessagesCircle/>}
                button={<BasicButton title="Neuer Channel" icon={<MessageCirclePlus />} disabled={!canManage} />}
            >   
                <div className="flex flex-row ">
                    <div className={`flex flex-col flex-1 p-2 gap-2 bg-surface border-r border-line`}>
                        {channels.map((channel) => (
                            <div 
                                key={channel.id}
                                className={`p-2 rounded hover:bg-line ${channel.id === activeChannelId ? "bg-line-accent" : "bg-surface-accent"}`}
                                onClick={() => handleSelectChannel(channel.id)}
                            >
                                {channel.name}
                            </div>
                        ))}
                    </div>
                    <div className="flex-4 p-2">
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message}/>
                        ))}
                    </div>
                    <div className="flex flex-row items-center justify-between">
                        <input 
                            type="text" 
                            value={messageContent} 
                            onChange={handleInputChange}
                            placeholder="Nachricht schreiben..."
                            className="p-1 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        <BasicButton 
                            icon={<SendHorizonal />} 
                            onClick={handleSendMessage}
                            disabled={!messageContent.trim()}
                        />
                    </div>
                </div>
            </BasicTile>
        </div>
    )
}
