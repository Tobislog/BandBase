import { useAuth } from "../context/AuthProvider";
import PageHeading from "../components/PageHeading";
import BasicTile from "../components/BasicTile";
import BasicButton from "../components/BasicButton";
import EventListItem from "../features/calendar/EventListItem";
import { CalendarDays, ClipboardList, MoveRight, MessagesCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../context/EventProvider";
import { compareEvents, toDateKey, toTimeKey} from "../utils/date";

const getEventStartKey = (event) => {
    return `${event.date}T${event.startTime || "00:00"}`;
};

const getNextEvent = (events, now = new Date()) => {
    const nowKey = `${toDateKey(now)}T${toTimeKey(now)}`;

    return [...events]
            .filter(event => event.date && getEventStartKey(event) >= nowKey)
            .sort(compareEvents)[0] ?? null;
};

export default function Home () {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {events} = useEvent();
    const today = new Date();
    const nextEvent = getNextEvent(events);
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const onEventClick = () => {
        navigate('/calendar');
    }

    return (
        <div>
            <PageHeading 
                title={`Hallo, ${user?.firstName ?? ''}!`} 
                subtitle={`Heute ist ${today.toLocaleDateString('de-DE', dateOptions)}. Hier siehst du, was für die Band ansteht.`}
            />
            <div className="flex flex-row gap-6 flex-wrap">
                <BasicTile 
                    title="Nächster Termin" 
                    icon={<CalendarDays />} 
                    button={<BasicButton 
                        title="Zum Kalender" 
                        icon={<MoveRight />}
                        onClick = {() => navigate('/calendar')}
                    />}
                >
                    <div className="p-2 min-w-100">
                        {nextEvent ? (
                            <EventListItem event={nextEvent} onClick={onEventClick}/>
                        ) : (
                            <div className="p-2">Keine Termine geplant.</div>
                        )}
                    </div>
                </BasicTile>
                <BasicTile
                    title="Offene Aufgaben"
                    icon={<ClipboardList />}
                    button={<BasicButton 
                        title="Alle Aufgaben"
                        icon={<MoveRight />}
                    />}
                >
                    <div className="p-2 min-w-100">
                        Hier kommt später die Aufgabenliste rein
                    </div>

                </BasicTile>
                <BasicTile 
                    title="Letzte Nachrichten"
                    icon={<MessagesCircle />}
                    button={<BasicButton 
                        title="Zum Messenger"
                        icon={<MoveRight />}    
                    />}
                >  
                    <div className="p-2 min-w-150">
                        Hier kommen später die letzten Nachrichten rein
                    </div>
                </BasicTile>

            </div>
        </div>
    );
}
