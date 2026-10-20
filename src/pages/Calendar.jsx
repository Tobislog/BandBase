import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";
import CalendarWidget from "../features/calendar/CalendarWidget";

export default function Calendar () {
    const handleAddEvent = () => {
        return
    }

    return (
        <div>
            <PageHeading 
                title="Calendar"
                subtitle="Band schedule & event planning"
                button={<BasicButton 
                            title="New Event"
                            icon={<CalendarPlus />}
                            onClick={handleAddEvent}
                        />}
            />
            <CalendarWidget />
            {/* Events-List */}
            <section>
                
            </section>
        </div>
    );
}
