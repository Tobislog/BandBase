import { createContext, useContext, useEffect, useState } from "react";
import { getStoredChannels, getStoredChannelsMembers, saveStoredChannelsMembers, getStoredMessages, saveStoredChannels, saveStoredMessages } from "../services/storageService";
import { useAuth } from "./AuthProvider";
import { useBand } from "./BandProvider";

const ChannelsContext = createContext(null);

export function ChannelsProvider({children}) {
    const { user } = useAuth();
    const { band }  = useBand();
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [userChannelIds, setUserChannelIds] = useState(new Set());
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!user?.id || !band?.id) {
            setChannels([]);
            setUserChannelIds(new Set())
            setLoading(false);
            return;
        }

        const memberSet = new Set(getStoredChannelsMembers().filter(m => m.userId === user.id).map(m => m.channelId));
        setUserChannelIds(memberSet);

        const userChannels = getStoredChannels().filter(c => c.bandId === band.id && memberSet.has(c.id))
        setChannels(userChannels);
        setLoading(false);

    }, [user?.id, band?.id]);

    useEffect(() => {
        if (!activeChannelId) {
            setMessages([]);
            return;
        }
        const allMessages = getStoredMessages();
        setMessages(allMessages.filter(m => m.channelId === activeChannelId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    }, [activeChannelId])

    const sendMessage = (channelId, content) => {
        if (!user.id) return;
        if(!content.trim()) return;
        if (!userChannelIds.has(channelId)) {
            throw new Error("User has no Permission")
        }

        const allMessages = getStoredMessages();
        const nextId = allMessages.length === 0 ? 1 : Math.max(...allMessages.map(m => Number(m.id))) + 1;

        const newMessage = {
            id: nextId,
            channelId: channelId,
            userId: user.id,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            editedAt: null
        }

        const updated = [...allMessages, newMessage];
        saveStoredMessages(updated);
        setMessages(prev => [...prev, newMessage].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        
    }

    const createEventChannel = (event) => {
        if(!user?.id || !band.id) return null;

        const allChannels = getStoredChannels();
        const nextId = allChannels.length === 0 ? 1 : Math.max(...allChannels.map(m => Number(m.id))) +1;
        
        const newChannel = {
            id: nextId,
            bandId: band.id,
            type: 'event',
            eventId: event.id,
            name: event.title || 'Event-Chat', 
            createdBy: user.id,
            createdAt: new Date().toISOString(),
        }
        const allChannelMembers = getStoredChannelsMembers();
        const newMember = {
            channelId: nextId,
            userId: user.id
        }  

        saveStoredChannels([...allChannels, newChannel]);
        saveStoredChannelsMembers([...allChannelMembers, newMember]);

        setChannels(prev => [...prev, newChannel]);
        setUserChannelIds(prev => new Set([...prev, nextId]));
        return nextId;
    }

    const deleteChannel = (channelId) => {
        if(!channelId) return;

        const allChannels = getStoredChannels();
        const updatedChannels = allChannels.filter(c => c.id !== channelId);
        saveStoredChannels(updatedChannels);
        setChannels(prev => prev.filter(c => c.id !== channelId));

        setUserChannelIds(prev => {
            const next = new Set(prev);
            next.delete(channelId);
            return next;
        })

        const allMembers = getStoredChannelsMembers();
        const updatedMembers = allMembers.filter(m => m.channelId !== channelId);
        saveStoredChannelsMembers(updatedMembers);

        const allMessages = getStoredMessages();
        const updatedMessages = allMessages.filter(m => m.channelId !== channelId);
        saveStoredMessages(updatedMessages);
        setMessages(prev => prev.filter(m => m.channelId !== channelId));

        if (activeChannelId === channelId){
            setActiveChannelId(null);
        }
    }


    return (
        <ChannelsContext.Provider
            value={{
                channels,
                createEventChannel,
                deleteChannel,
                activeChannelId,
                setActiveChannelId,
                messages,
                sendMessage,
                loading
            }}>
                {children}
        </ChannelsContext.Provider>
    )
}

export function useChannels() {
    const ctx = useContext(ChannelsContext);
        if (!ctx) throw new Error("useChannels must be used within a ChannelsProvider");
        return ctx;
}
