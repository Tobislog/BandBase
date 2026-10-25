import { createContext, useContext, useState, useEffect } from "react";
import { saveStoredEvents, getStoredEvents } from "../services/storageService";
import { compareEvents } from "../utils/date";
import { normalizeEvent } from "../utils/event";

const EventContext = createContext(null);

const sortEvents = (events) => [...events].sort(compareEvents);


export function EventProvider({children}) {
    const [events, setEvents] = useState(() => sortEvents(getStoredEvents()));
    
    useEffect(() => {
        saveStoredEvents(events);
    }, [events]);

    const saveEvent = (savedEvent) => {
        const normalizedEvent = normalizeEvent(savedEvent);

        setEvents(prev =>
            sortEvents(
                prev.some(e => e.id === normalizedEvent.id)
                    ? prev.map(e => e.id === normalizedEvent.id ? normalizedEvent : e)
                    : [...prev, normalizedEvent]
            )
        );
    };

    const deleteEvent = (id) => {
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
