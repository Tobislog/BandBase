import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";
import CalendarWidget from "../features/calendar/CalendarWidget";
import { useState } from "react";
import EventModal from "../features/calendar/EventModal";
import EventList from "../features/calendar/EventList";
import { useEvent } from "../context/EventProvider";

export default function Calendar () {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { events, saveEvent, deleteEvent} = useEvent();
    const [modalEvent, setModalEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const closeModal = () => {
        setIsModalOpen(false);
        setModalEvent(null);
    }

    const handleDeleteEvent = () => {
        if (!modalEvent?.id) return;
        deleteEvent(modalEvent.id);
        closeModal();
    }

    const handleDayClick = (dateString) => {
        setModalEvent({ date: dateString });
        setIsModalOpen(true);
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
            <div className="flex flex-row flex-wrap gap-6">
                <CalendarWidget 
                    events={events}
                    onOpenEvent={handleOpenEvent}
                    onDayClick={handleDayClick}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                />
                <EventList 
                    events={events}
                    currentDate={currentDate}
                    onClick={handleOpenEvent}
                />
                {isModalOpen && (
                    <EventModal
                        key={modalEvent?.id ?? "new-event"}
                        event={modalEvent}
                        onClose={closeModal}
                        onSave={saveEvent}
                        onDelete={handleDeleteEvent}
                    />
                )}
            </div>
        </div>
    );
}
