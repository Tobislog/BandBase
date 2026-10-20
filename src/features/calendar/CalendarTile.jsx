export default function CalendarTile ({ day }) {
    return(
        <>
            {day !== null ? (
                <div className="border border-line h-20 p-1 hover:bg-line">
                    <div>
                        <p className={`p-0.5`}>{day}</p>
                    </div>
                </div>
            ):(
                <div className="border border-line h-20 p-1">
                </div>
            ) }
            
        </>
    )
}
