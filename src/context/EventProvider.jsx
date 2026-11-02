import { createContext, useContext, useState, useEffect } from "react";
import { compareEvents } from "../utils/date";
import { createEvent, deleteEvent as deleteEventRequest, getEvents, updateEvent} from "../services/eventService";
import { useChannels } from "./ChannelProvider";
import { useBand } from "./BandProvider";

const EventContext = createContext(null);

const sortEvents = (events) => [...events].sort(compareEvents);


export function EventProvider({children}) {
    const { band, membership, activeBandId } = useBand();
    const { refreshChannels } = useChannels();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!membership || !activeBandId) {
                if (!cancelled) {
                    setEvents([]);
                    setError('');
                    setLoading(false);
                }
                return;
            }
            setLoading(true);
            setError('');

            try {
                const nextEvents = await getEvents(activeBandId);
                if (!cancelled) setEvents(sortEvents(nextEvents));
            } catch (err) {
                if (!cancelled) {
                    setEvents([]);
                    setError(err.message || 'Events konnten nicht geladen werden.');
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

    const saveEvent = async (savedEvent) => {
        if (!membership || !band?.id) {
            throw new Error('Keine aktive Band ausgewählt.');
        }

        const payload = {
            title: savedEvent.title ?? '',
            date: savedEvent.date ?? '',
            description: savedEvent.description ?? '',
            category: savedEvent.category ?? 'other',
            meetupTime: savedEvent.meetupTime || null,
            startTime: savedEvent.startTime ?? '',
            endTime: savedEvent.endTime || null,
            setlistId: savedEvent.setlistId || null,
        };

        try {
            setError('');

            const saved = savedEvent.id != null
                ? await updateEvent(savedEvent.id, payload)
                : await createEvent(band.id, payload);

            setEvents((current) => {
                const exists = current.some((event) => event.id === saved.id);
                return sortEvents(
                    exists
                        ? current.map((event) => (event.id === saved.id ? saved : event))
                        : [...current, saved]
                );
            });

            await refreshChannels();
            return saved;
        } catch (err) {
            setError(err.message || 'Event konnte nicht gespeichert werden.');
            throw err;
        }
    };

    const deleteEvent = async (eventId) => {
        if (eventId == null) return;

        try {
            setError('');
            await deleteEventRequest(eventId);
            setEvents((current) => current.filter((event) => event.id !== eventId));
            await refreshChannels();
        } catch (err) {
            setError(err.message || 'Event konnte nicht gelöscht werden.');
            throw err;
        }
    };

    return (
        <EventContext.Provider value={{ events, saveEvent, deleteEvent, loading, error }}>
            {children}
        </EventContext.Provider>
    );

}

export function useEvent() {
    return useContext(EventContext);
}
