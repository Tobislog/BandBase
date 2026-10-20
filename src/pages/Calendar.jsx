import { CalendarPlus } from "lucide-react";
import BasicButton from "../components/BasicButton";
import PageHeading from "../components/PageHeading";

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
            {/* Calender-Widget */}
            <section>
                
            </section>
            {/* Events-List */}
            <section>
                
            </section>
        </div>
    );
}
