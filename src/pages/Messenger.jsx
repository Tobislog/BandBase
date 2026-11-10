import BasicTile from "../components/BasicTile"
import BasicButton from "../components/BasicButton"

import { useEffect } from "react"
import { useBand } from "../context/BandProvider"
import { useChannels } from "../context/ChannelProvider"
import { MessageCirclePlus, MessagesCircle } from "lucide-react"
import MessageWidget from "../features/messages/MessageWidget"

export default function Messenger () {
    const { canManage } = useBand();
    const { channels, activeChannelId, setActiveChannelId} = useChannels();

    useEffect(() => {
        if (channels && channels.length > 0 && !activeChannelId) {
            setActiveChannelId(channels[0].id);
        }
    }, [channels, activeChannelId, setActiveChannelId])

    const handleSelectChannel = (id) => {
        setActiveChannelId(id);
    }

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
                    <MessageWidget className="flex-4" />
                </div>
            </BasicTile>
        </div>
    )
}
