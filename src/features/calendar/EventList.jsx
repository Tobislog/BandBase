import { CalendarChevronsRight } from "lucide-react";
import BasicTile from "../../components/BasicTile";

export default function EventList ({events, currentDate, onClick}) {
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const activeMonthEvents = events.filter(e => {
        const eventDate = new Date(e.date);

        const isSameMonth = eventDate.getMonth() === currentMonthIndex;
        const isSameYear = eventDate.getFullYear() === currentYear;

        return isSameMonth && isSameYear;
    })

    return (
        <BasicTile
            title="Upcomming"
            icon={<CalendarChevronsRight />}
        >
            <div className="flex flex-col gap-2 p-2">
            {activeMonthEvents.map((event) => (
                <div 
                    onClick={() => onClick(event)}
                    className="flex flex-col bg-surface rounded p-2 cursor-pointer"
                >
                    <div>
                        {event.title}
                    </div>
                    <div>
                        {event.date}
                    </div>
                </div>
                
            ))}
            </div>
        </BasicTile>
    )
}
