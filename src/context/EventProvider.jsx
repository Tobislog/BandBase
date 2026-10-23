import { createContext, useContext, useState, useEffect } from "react";
import { saveStoredEvents, getStoredEvents } from "../services/storageService";

const EventContext = createContext(null);

const sortEvents = (events) =>
    [...events].sort((a, b) => new Date(a.date) - new Date(b.date));


export function EventProvider({children}) {
    const [events, setEvents] = useState(() => sortEvents(getStoredEvents()));
    
    useEffect(() => {
        const loadedEvents = getStoredEvents();
        setEvents(loadedEvents);
    }, []);

    const saveEvent = (savedEvent) => {
        setEvents(prev =>
            sortEvents(
                prev.some(e => e.id === savedEvent.id)
                    ? prev.map(e => e.id === savedEvent.id ? savedEvent : e)
                    : [...prev, savedEvent]
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
