export default function CalendarTile ({ day }) {
    const today = new Date();

    const checkIfToday = (day) => {
        if (day === null) return false;
        return (
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate()
        )
    };

    const isToday = checkIfToday(day);

    return(
        <>
            {day !== null ? (
                <div className="border border-line h-20 p-1 hover:bg-line">
                    <div>
                        <p className={`p-0.5 rounded-xl max-w-6.5 ${isToday ? 'bg-brand' : ''}`}>{day.getDate()}</p>
                    </div>
                </div>
            ):(
                <div className="border border-line h-20 p-1">
                </div>
            ) }
            
        </>
    )
}
