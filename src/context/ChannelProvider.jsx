import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    getChannels,
    getMessages,
    sendMessage as sendMessageRequest,
} from "../services/channelService";
import { useBand } from "./BandProvider";

const ChannelsContext = createContext(null);

export function ChannelsProvider({ children }) {
    const { activeBandId, membership } = useBand();
    const [channels, setChannels] = useState([]);
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState('');

    const refreshChannels = useCallback(async () => {
        if (!membership || !activeBandId) {
            setChannels([]);
            return [];
        }

        try {
            const nextChannels = await getChannels(activeBandId);
            setChannels(nextChannels);
            setActiveChannelId((current) => (
                nextChannels.some((channel) => channel.id === current) ? current : null
            ));
            return nextChannels;
        } catch (err) {
            setError(err.message || 'Channels konnten nicht geladen werden.');
            return [];
        }
    }, [activeBandId, membership]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!membership || !activeBandId) {
                if (!cancelled) {
                    setChannels([]);
                    setActiveChannelId(null);
                    setError('');
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError('');

            try {
                const nextChannels = await getChannels(activeBandId);
                if (cancelled) return;

                setChannels(nextChannels);
                setActiveChannelId((current) => (
                    nextChannels.some((channel) => channel.id === current) ? current : null
                ));
            } catch (err) {
                if (!cancelled) {
                    setChannels([]);
                    setError(err.message || 'Channels konnten nicht geladen werden.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeBandId, membership]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeChannelId) {
                if (!cancelled) setMessages([]);
                return;
            }

            setMessagesLoading(true);
            setError('');

            try {
                const nextMessages = await getMessages(activeChannelId);
                if (!cancelled) setMessages(nextMessages);
            } catch (err) {
                if (!cancelled) {
                    setMessages([]);
                    setError(err.message || 'Nachrichten konnten nicht geladen werden.');
                }
            } finally {
                if (!cancelled) setMessagesLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeChannelId]);

    const sendMessage = async (channelId, content) => {
        if (!channelId) return null;

        const trimmed = typeof content === 'string' ? content.trim() : '';
        if (!trimmed) return null;

        try {
            setError('');
            const message = await sendMessageRequest(channelId, trimmed);

            if (message.channelId === activeChannelId) {
                setMessages((current) => (
                    [...current, message].sort((a, b) => (
                        a.createdAt.localeCompare(b.createdAt) || a.id - b.id
                    ))
                ));
            }

            return message;
        } catch (err) {
            setError(err.message || 'Nachricht konnte nicht gesendet werden.');
            throw err;
        }
    };

    return (
        <ChannelsContext.Provider
            value={{
                channels,
                activeChannelId,
                setActiveChannelId,
                messages,
                sendMessage,
                refreshChannels,
                loading,
                messagesLoading,
                error,
            }}
        >
            {children}
        </ChannelsContext.Provider>
    );
}

export function useChannels() {
    const ctx = useContext(ChannelsContext);
    if (!ctx) throw new Error("useChannels must be used within a ChannelsProvider");
    return ctx;
}
