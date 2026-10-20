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

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Rehearsal': return 'bg-rehearsal/20 text-rehearsal';
            case 'Gig': return 'bg-gig/20 text-gig';
            default: return 'bg-brand/20 text-brand';
        }
    }

    const getDaysUntilEvent = (event) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return null;
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'in 1 Day';
    
        // For all Days > 1
        return `in ${diffDays} Days`;
    }

    return (
        <BasicTile
            title="Upcomming"
            icon={<CalendarChevronsRight />}
        >
            <div className="flex flex-col gap-2 p-2">
            {activeMonthEvents.map((event) => (
                <div 
                    key={event.id}
                    onClick={() => onClick(event)}
                    className="flex flex-col bg-surface rounded p-2 cursor-pointer"
                >
                    <div className="flex gap-6 justify-between">
                        <div className="flex gap-1">
                            <span className={`rounded-xl px-2 py-1 text-xs ${getCategoryColor(event.category)}`}>{event.category}</span>
                            <span className="font-bold">{event.title}</span>
                        </div>
                        <span className="rounded-xl px-2 py-1 text-xs bg-line">{getDaysUntilEvent(event)}</span>
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
