import { createContext, useContext, useState, useEffect } from "react";
import { saveStoredEvents, getStoredEvents } from "../services/storageService";
import { compareEvents } from "../utils/date";
import { normalizeEvent, getNextEventId } from "../utils/event"
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

        const isExisting = normalizedEvent.id !== null
            && events.some(e => e.id === normalizedEvent.id);

        const eventToSave = isExisting ? normalizedEvent : {...normalizedEvent, id: getNextEventId(events)};

        if(!eventToSave.channelId) {
            eventToSave.channelId = createEventChannel(eventToSave);
        }

        setEvents(prev =>
            sortEvents(
                isExisting
                    ? prev.map(e => e.id === eventToSave.id ? eventToSave : e)
                    : [...prev, eventToSave]
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
