import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";
import CalendarWidget from "../features/calendar/CalendarWidget";
import { useState, useEffect } from "react";
import EventModal from "../features/calendar/EventModal";
import { getStoredEvents, saveStoredEvents } from "../services/storageService";

export default function Calendar () {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [modalEvent, setModalEvent] = useState(null);

    useEffect(() => {
        const loadedEvents = getStoredEvents();
        setEvents(loadedEvents);
    }, []);

    const handleSaveEvent = (savedEvent) => {

        const exists = events.some(e => e.id === savedEvent.id);

        let updatedEvents;
        if (exists) {
            updatedEvents = events.map(e => e.id === savedEvent.id ? savedEvent : e)
        } else {
            updatedEvents = [...events, savedEvent];
        }
        setEvents(updatedEvents);
        saveStoredEvents(updatedEvents);
    }

    const handleDeleteEvent = () => {
        if (!modalEvent) return;

        const updatedEvents = events.filter(e => e.id !== modalEvent.id);
        setEvents(updatedEvents);
        saveStoredEvents(updatedEvents);
        setIsModalOpen(false);
        setModalEvent(null);
    }

    const handleOpenEvent = (event) => {
        setModalEvent(event);
        setIsModalOpen(true);
    }

    const handleNewEventClick = () => {
        setModalEvent(null);
        setIsModalOpen(true)
    }

    return (
        <div>
            <PageHeading 
                title="Calendar"
                subtitle="Band schedule & event planning"
                button={<BasicButton 
                            title="New Event"
                            icon={<CalendarPlus />}
                            onClick={handleNewEventClick}
                        />}
            />
            <CalendarWidget 
                events={events}
                onOpenEvent={handleOpenEvent}
            />
            {/* Events-List */}
            <section>
                
            </section>
            <EventModal
                isOpen={isModalOpen}
                event={modalEvent}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />
        </div>
    );
}
