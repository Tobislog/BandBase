import { createContext, useContext, useState, useEffect } from "react";
import { saveStoredEvents, getStoredEvents } from "../services/storageService";
import { compareEvents } from "../utils/date";
import { normalizeEvent } from "../utils/event"
import { useChannels } from "./ChannelProvider";

const EventContext = createContext(null);

const sortEvents = (events) => [...events].sort(compareEvents);


export function EventProvider({children}) {
    const [events, setEvents] = useState(() => sortEvents(getStoredEvents()));
    const { createEventChannel, deleteChannel } = useChannels();
    
    useEffect(() => {
        saveStoredEvents(events);
    }, [events]);

    const saveEvent = (savedEvent) => {
        const normalizedEvent = normalizeEvent(savedEvent);

        if(!normalizedEvent.id || !normalizedEvent.channelId) {
            const channelId = createEventChannel(normalizedEvent);
            normalizedEvent.channelId = channelId;
        }

        setEvents(prev =>
            sortEvents(
                prev.some(e => e.id === normalizedEvent.id)
                    ? prev.map(e => e.id === normalizedEvent.id ? normalizedEvent : e)
                    : [...prev, normalizedEvent]
            )
        );
    };

    const deleteEvent = (id) => {
        const eventToDelete = events.find(e => e.id === id);
        if (eventToDelete?.channelId) {
            deleteChannel(eventToDelete.channelId);
        }
        setEvents(prev => prev.filter(e => e.id !== id));
    };


    return (
        <EventContext.Provider value={{ events, saveEvent, deleteEvent }}>
            {children}
        </EventContext.Provider>
    )

}

export function useEvent() {
    return useContext(EventContext);
}
