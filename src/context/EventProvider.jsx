import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { saveStoredEvents, getStoredEvents } from "../services/storageService";
import { compareEvents } from "../utils/date";
import { normalizeEvent, getNextEventId } from "../utils/event"
import { useChannels } from "./ChannelProvider";
import { useBand } from "./BandProvider";

const EventContext = createContext(null);

const sortEvents = (events) => [...events].sort(compareEvents);


export function EventProvider({children}) {
    const { band, membership } = useBand();
    const [allEvents, setAllEvents] = useState(() =>
        sortEvents(getStoredEvents())
    );
    const { createEventChannel, deleteChannel, deleteEventChannels } = useChannels();

    const events = useMemo(
        () => membership && band?.id
            ? sortEvents(allEvents.filter(e => String(e.bandId) === String(band.id)))
            : [],
        [allEvents, band, membership]
    );

    useEffect(() => {
        saveStoredEvents(allEvents);
    }, [allEvents]);

    const saveEvent = (savedEvent) => {
        if (!membership || !band?.id) return;

        const normalizedEvent = normalizeEvent(savedEvent);

        const isExisting = normalizedEvent.id != null
            && allEvents.some(e => e.id === normalizedEvent.id);

        const eventToSave = isExisting
            ? normalizedEvent
            : {
                ...normalizedEvent,
                id: getNextEventId(allEvents),
                bandId: normalizedEvent.bandId ?? band.id,
            };

        if(!eventToSave.channelId) {
            eventToSave.channelId = createEventChannel(eventToSave);
        }

        setAllEvents(prev =>
            sortEvents(
                isExisting
                    ? prev.map(e => e.id === eventToSave.id ? eventToSave : e)
                    : [...prev, eventToSave]
            )
        );
    };

    const deleteEvent = (id) => {
        const eventToDelete = allEvents.find(e => e.id === id);
        if (eventToDelete?.channelId != null) {
            deleteChannel(eventToDelete.channelId);
        }
        deleteEventChannels(id);
        setAllEvents(prev => prev.filter(e => e.id !== id));
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
