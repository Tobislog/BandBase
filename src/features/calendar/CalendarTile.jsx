export default function CalendarTile ({ day, events }) {
    const today = new Date();

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

        const year = day.getFullYear();
        const month = String(day.getMonth() +1).padStart(2, '0');
        const dayNum = String(day.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayNum}`;

        return events.filter(event => event.date === dateString);

    }

    const tileEvents = getDayEvents();

    const isToday = checkIfToday(day);

    return(
        <>
            {day !== null ? (
                <div className="border border-line h-20 p-1 hover:bg-line overflow-hidden">
                    <div>
                        <p className={`p-0.5 rounded-xl max-w-6.5 ${isToday ? 'bg-brand' : ''}`}>{day.getDate()}</p>
                    </div>
                    <div>
                        {tileEvents.map((event, index) => (
                            <span
                                key={index}
                                className="bg-brand/20 text-brand px-1 rounded"
                                title="event.title"
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
