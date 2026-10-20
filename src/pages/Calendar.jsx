import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";
import CalendarWidget from "../features/calendar/CalendarWidget";
import { useState } from "react";
import EventModal from "../features/calendar/EventModal";

export default function Calendar () {
    const [isModalOpen, setIsModalOpen] = useState(false);


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
            <CalendarWidget />
            {/* Events-List */}
            <section>
                
            </section>
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
