import { createContext, useContext, useEffect, useState } from "react";
import { getStoredChannels, getStoredChannelsMembers, saveStoredChannelsMembers, getStoredMessages, saveStoredChannels, saveStoredMessages } from "../services/storageService";
import { getUsersBatch } from "../services/authService";
import { useAuth } from "./AuthProvider";
import { useBand } from "./BandProvider";

const ChannelsContext = createContext(null);

const isEventChannelOfBand = (channel, bandid, isBandMember) =>
    channel?.type === 'event'
    && String(channel.bandId) === String(bandid)
    && isBandMember;

export function ChannelsProvider({children}) {
    const { user } = useAuth();
    const { band, membership }  = useBand();
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [userChannelIds, setUserChannelIds] = useState(new Set());
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userCache, setUserCache] = useState({}); // Format: {[userID]: "Vorname Nachname"}
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!user?.id || !band?.id) {
            setChannels([]);
            setUserChannelIds(new Set())
            setLoading(false);
            return;
        }
        const isBandMember = Boolean(membership);

        const memberIds = new Set(getStoredChannelsMembers().filter(m => m.userId === user.id).map(m => m.channelId));

        const allChannels = getStoredChannels().filter(c => String(c.bandId) === String(band.id));
        const userChannels = allChannels.filter(c => memberIds.has(String(c.id)) || isEventChannelOfBand(c, band.id, isBandMember));

        setUserChannelIds(new Set(userChannels.map(c => String(c.id))));
        setChannels(userChannels);
        setLoading(false);

    }, [user?.id, band?.id, membership]);


    useEffect(() => {
        if (!activeChannelId) {
            setMessages([]);
            return;
        }
        const allMessages = getStoredMessages();
        setMessages(allMessages.filter(m => m.channelId === activeChannelId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    }, [activeChannelId])

    useEffect(() => {
        const missingIds = [...new Set(
            messages
                .map(m => m.userId)
                .filter(id => id && !userCache[id])
        )]

        if (missingIds.length === 0) return;

        const fetchUserNames = async () => {
            try {
                const users = await getUsersBatch(missingIds);
                if (!users || !Array.isArray(users)) return;

                setUserCache(prev => {
                    const updated = {...prev};
                    users.forEach(u => {
                        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
                        updated[u.id] = fullName || u.email; // Fallback if no fullName
                    })
                    return updated;
                });
            } catch (error) {
                console.error("Konnte Usernamen für den Chat nicht laden: ", error)
            }
        }
        fetchUserNames();
    }, [messages, userCache])

    const sendMessage = (channelId, content) => {
        if (!user.id || !band?.id) return;
        if(!content.trim()) return;

        const channel = getStoredChannels().find(c => String(c.id) === String(channelId));
        const hasAccess = userChannelIds.has(String(channelId)) || isEventChannelOfBand(channel, band.id, Boolean(membership));

        if (!hasAccess) {
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
        if(!user?.id || !band?.id) return null;

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
        saveStoredChannels([...allChannels, newChannel]);

        setChannels(prev => [...prev, newChannel]);
        setUserChannelIds(prev => new Set([...prev, nextId]));
        return nextId;
    }

    const deleteChannels = (channelIds) => {
        const idsToDelete = new Set(
            (channelIds ?? []).filter(id => id != null).map(String)
        );
        if (idsToDelete.size === 0) return;

        const allChannels = getStoredChannels();
        saveStoredChannels(allChannels.filter(c => !idsToDelete.has(String(c.id))));
        setChannels(prev => prev.filter(c => !idsToDelete.has(String(c.id))));

        setUserChannelIds(prev => {
            const next = new Set(prev);
            next.forEach(id => {
                if (idsToDelete.has(String(id))) next.delete(id);
            });
            return next;
        });

        const allMembers = getStoredChannelsMembers();
        saveStoredChannelsMembers(allMembers.filter(m => !idsToDelete.has(String(m.channelId))));

        const allMessages = getStoredMessages();
        saveStoredMessages(allMessages.filter(m => !idsToDelete.has(String(m.channelId))));
        setMessages(prev => prev.filter(m => !idsToDelete.has(String(m.channelId))));

        if (activeChannelId != null && idsToDelete.has(String(activeChannelId))) {
            setActiveChannelId(null);
        }
    }

    const deleteChannel = (channelId) => {
        if (channelId == null) return;
        deleteChannels([channelId]);
    }

    const deleteEventChannels = (eventId) => {
        if (eventId == null) return;
        const channelIds = getStoredChannels()
            .filter(c => String(c.eventId) === String(eventId))
            .map(c => c.id);
        deleteChannels(channelIds);
    }

    return (
        <ChannelsContext.Provider
            value={{
                channels,
                createEventChannel,
                deleteChannel,
                deleteEventChannels,
                activeChannelId,
                setActiveChannelId,
                messages,
                sendMessage,
                userCache,
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
