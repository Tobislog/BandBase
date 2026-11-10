import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";
import CalendarWidget from "../features/calendar/CalendarWidget";
import { useState, useEffect } from "react";
import EventModal from "../features/calendar/EventModal";
import EventList from "../features/calendar/EventList";
import { useEvent } from "../context/EventProvider";
import { useBand } from "../context/BandProvider";

export default function Calendar () {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { events, saveEvent, deleteEvent, loading, error } = useEvent();
    const { canManage } = useBand();
    const [modalEvent, setModalEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    

    const closeModal = () => {
        setIsModalOpen(false);
        setModalEvent(null);
    }

    const handleDeleteEvent = async (eventId) => {
        if (!eventId) return;
        await deleteEvent(eventId);
    }

    const handleDayClick = (dateString) => {
        if (!canManage) return;
        setModalEvent({ date: dateString });
        setIsModalOpen(true);
    }

    const handleOpenEvent = (event) => {
        setModalEvent(event);
        setIsModalOpen(true);
    }

    const handleNewEventClick = () => {
        if (!canManage) return;
        setModalEvent(null);
        setIsModalOpen(true)
    }
    
    // Eventlistener for closeModal on ESC-Press
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isModalOpen, closeModal]);

    return (
        <div>
            <PageHeading 
                title="Calendar"
                subtitle="Band schedule & event planning"
                button={canManage ? (
                    <BasicButton 
                        title="New Event"
                        icon={<CalendarPlus />}
                        onClick={handleNewEventClick}
                    />
                ) : null}
            />
            {error && (
                 <div className="mb-4 rounded-md border border-red-500/40 bg-red-400/10 px-3 py-2 text-sm text-red-500">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm">
                    Lade Events...
                </div>
            ) : (
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
            )}
        </div>
    );
}
