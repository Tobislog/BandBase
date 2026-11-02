import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import PageHeading from "../components/PageHeading";
import BasicTile from "../components/BasicTile";
import BasicButton from "../components/BasicButton";
import EventListItem from "../features/calendar/EventListItem";
import { CalendarDays, ClipboardList, MoveRight, MessagesCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../context/EventProvider";
import { useBand } from "../context/BandProvider";
import { getRecentMessages } from "../services/channelService";
import RecentMessageList from "../features/messages/RecentMessageList";
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
    const { user } = useAuth();
    const { activeBandId } = useBand();
    const {events, loading: eventsLoading, error: eventsError } = useEvent();
    const [recentMessages, setRecentMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [messagesError, setMessagesError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeBandId) {
                if (!cancelled) {
                    setRecentMessages([]);
                    setMessagesError('');
                    setMessagesLoading(false);
                }
                return;
            }

            setMessagesLoading(true);
            setMessagesError('');

            try {
                const nextMessages = await getRecentMessages(activeBandId, 5);
                if (!cancelled) setRecentMessages(nextMessages);
            } catch (err) {
                if (!cancelled) {
                    setRecentMessages([]);
                    setMessagesError(err.message || 'Nachrichten konnten nicht geladen werden.');
                }
            } finally {
                if (!cancelled) setMessagesLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeBandId]);

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
                        {eventsLoading ? (
                            <div className="p-2">Lade Termine...</div>
                        ) : eventsError ? (
                            <div className="p-2 text-sm text-red-500">{eventsError}</div>
                        ) : nextEvent ? (
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
                        Comming soon...
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
                        {messagesLoading ? (
                            <div className="p-2">Lade Nachrichten...</div>    
                        ) : messagesError ? (
                            <div className="p-2 text-sm text-red-500">{messagesError}</div>   
                        ) : recentMessages.length > 0 ? (
                            <RecentMessageList messages={recentMessages} />
                        ) : (
                            <div className="p-2">Noch keine Nachrichten vorhanden.</div>
                        )}
                    </div>
                </BasicTile>

            </div>
        </div>
    );
}
