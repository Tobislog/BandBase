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

    useEffect(() => {
        const loadedEvents = getStoredEvents();
        setEvents(loadedEvents);
    }, []);

    const handleSaveEvent = (newEvent) => {
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        saveStoredEvents(updatedEvents);
    }

    return (
        <div>
            <PageHeading 
                title="Calendar"
                subtitle="Band schedule & event planning"
                button={<BasicButton 
                            title="New Event"
                            icon={<CalendarPlus />}
                            onClick={() => setIsModalOpen(true)}
                        />}
            />
            <CalendarWidget events={events}/>
            {/* Events-List */}
            <section>
                
            </section>
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
            />
        </div>
    );
}
