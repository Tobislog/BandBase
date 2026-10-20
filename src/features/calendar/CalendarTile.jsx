export default function CalendarTile ({ day, events , onOpenEvent, onDayClick}) {
    const today = new Date();

    const formatDateString = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() +1).padStart(2, '0');
        const dayNum = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${dayNum}`;
    }

    const checkIfToday = (day) => {
        if (day === null) return false;
        return (
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate()
        )
    };

    const getDayEvents = () => {
        if(!day) return [];

        return events.filter(event => event.date === formatDateString(day));

    }

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Rehearsal': return 'bg-rehearsal/20 text-rehearsal';
            case 'Gig': return 'bg-gig/20 text-gig';
            default: return 'bg-brand/20 text-brand';
        }
    }

    const tileEvents = getDayEvents();
    const isToday = checkIfToday(day);


    return(
        <>
            {day !== null ? (
                <div 
                    key={day.getDate()}
                    className="border  border-line h-25 p-1 hover:bg-line overflow-hidden cursor-pointer min-w-0 max-w-30"
                    onClick={() => onDayClick(formatDateString(day))}
                >
                    <div>
                        <p className={`p-0.5 rounded-xl max-w-6.5 ${isToday ? 'bg-brand' : ''}`}>{day.getDate()}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-x-auto min-w-0">
                        {tileEvents.map((event, index) => (
                            <span
                                key={event.id || index}
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
