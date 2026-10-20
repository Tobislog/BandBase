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

    

    const tileEvents = getDayEvents();
    const isToday = checkIfToday(day);


    return(
        <>
            {day !== null ? (
                <div 
                    key={day.getDate()}
                    className="border min-w-20 border-line h-20 p-1 hover:bg-line overflow-hidden cursor-pointer"
                    onClick={() => onDayClick(formatDateString(day))}
                >
                    <div>
                        <p className={`p-0.5 rounded-xl max-w-6.5 ${isToday ? 'bg-brand' : ''}`}>{day.getDate()}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        {tileEvents.map((event, index) => (
                            <span
                                key={event.id || index}
                                id={event.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEvent(event);
                                }}
                                className="text-xs bg-brand/20 text-brand px-1 rounded cursor-pointer"
                            >
                                {event.title}
                            </span>
                        ))}
                    </div>
                </div>
            ):(
                <div className="border border-line h-20 p-1">
                </div>
            ) }
            
        </>
    )
}
