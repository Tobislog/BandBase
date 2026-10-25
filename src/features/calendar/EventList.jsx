import { CalendarChevronsRight } from "lucide-react";
import BasicTile from "../../components/BasicTile";
import EventListItem from "./EventListItem";
import { toDateKey } from "../../utils/date";

export default function EventList ({events, currentDate, onClick}) {

    const monthKey = toDateKey(currentDate).slice(0, 7);
    const todayKey = toDateKey(new Date());

    const activeMonthEvents = events.filter(event => event.date?.startsWith(monthKey) && event.date >= todayKey);

    return (
        <BasicTile
            title="Upcomming"
            icon={<CalendarChevronsRight />}
        >
            <div className="flex flex-col gap-2 p-2">
            {activeMonthEvents.map((event) => (
                <EventListItem
                    key={event.id} 
                    event={event}
                    onClick={onClick}
                />
                
            ))}
            </div>
        </BasicTile>
    )
}
