import { ChevronLeft, ChevronRight } from "lucide-react"
import BasicButton from "../../components/BasicButton"
import BasicTile from "../../components/BasicTile"
import { useState } from "react";

export default function CalendarWidget () {
    const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const [currentDate, setCurrentDate] = useState(new Date());
    const activeMonth = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(currentDate);
    const activeYear = currentDate.getFullYear();

    console.log(weekDays[currentDate.getDay()])

    
    const handleMonthChange = (steps) => {  
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + steps);
        setCurrentDate(nextDate);
    };

    const handleSetDateToday = () => {
        setCurrentDate(new Date());
    }


    return (
        <div className="max-w-150">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    {activeMonth} {activeYear}
                </div>
                <div className="flex gap-2 items-center">
                    <BasicButton icon={<ChevronLeft />} onClick={() => handleMonthChange(-1)}/>
                    <BasicButton title="Heute" onClick={handleSetDateToday}/>
                    <BasicButton icon={<ChevronRight />} onClick={() => handleMonthChange(1)}/>

                </div>
            </div>
            <BasicTile>
                {/* Title-Row, Day-Names */}
                <div className="grid grid-cols-7">
                    {weekDays.map((day, index) => (
                        <div 
                            key={index}
                            className="pl-2 border border-line"
                        >
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    
                </div>
            </BasicTile>
        </div>    
    )
}
