import {toDateKey} from "../../utils/date";

export default function CalendarTile ({ day, events , onOpenEvent, onDayClick}) {
    
    const dayKey = day ? toDateKey(day) : null;
    const todayKey = toDateKey(new Date());

    const isToday = dayKey === todayKey;
    const tileEvents =  dayKey ? events.filter(event => event.date === dayKey) : [];
    
    const getCategoryColor = (category) => {
        switch (category) {
            case 'rehearsal': return 'bg-rehearsal/20 text-rehearsal';
            case 'gig': return 'bg-gig/20 text-gig';
            default: return 'bg-brand/20 text-brand';
        }
    }

    return(
        <>
            {day !== null ? (
                <div 
                    className="border  border-line h-25 p-1 hover:bg-line overflow-hidden cursor-pointer min-w-0"
                    onClick={() => onDayClick(dayKey)}
                >
                    <div>
                        <p className={`p-0.5 rounded-xl max-w-6.5 ${isToday ? 'bg-brand' : ''}`}>{day.getDate()}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-x-auto min-w-0">
                        {tileEvents.map((event) => (
                            <span
                                key={event.id}
                                id={event.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEvent(event);
                                }}
                                className={`text-xs px-1 rounded cursor-pointer truncate ${getCategoryColor(event.category)}`}
                            >
                                {event.title}
                            </span>
                        ))}
                    </div>
                </div>
            ):(
                <div className="border border-line h-25 p-1">
                </div>
            ) }
            
        </>
    )
}
