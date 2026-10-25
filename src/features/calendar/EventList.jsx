import { CalendarChevronsRight } from "lucide-react";
import BasicTile from "../../components/BasicTile";
import { toDateKey, formatDateKey, daysUntil, formatEventTimeRange } from "../../utils/date";

    const formatDaysUntil = (dateKey) => {
        const days = daysUntil(dateKey);

        if (days < 0) return null;
        if (days === 0) return "today";
        if (days === 1) return "in 1 days";
        
        return `in ${days} Days`;
    }

export default function EventList ({events, currentDate, onClick}) {

    const monthKey = toDateKey(currentDate).slice(0, 7);
    const todayKey = toDateKey(new Date());


    
    const activeMonthEvents = events.filter(event => event.date?.startsWith(monthKey) && event.date >= todayKey
    );

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Rehearsal': return 'bg-rehearsal/20 text-rehearsal';
            case 'Gig': return 'bg-gig/20 text-gig';
            default: return 'bg-brand/20 text-brand';
        }
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
                        <span className="rounded-xl px-2 py-1 text-xs bg-line">{formatDaysUntil(event.date)}</span>
                    </div>
                    <div className="text-sm p-1">
                        {formatDateKey(event.date)}
                        {event.startTime && ` · ${formatEventTimeRange(event)}`}
                    </div>
                </div>
                
            ))}
            </div>
        </BasicTile>
    )
}
