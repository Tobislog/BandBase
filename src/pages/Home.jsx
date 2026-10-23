import { useAuth } from "../context/AuthProvider";
import PageHeading from "../components/PageHeading";
import BasicTile from "../components/BasicTile";
import BasicButton from "../components/BasicButton";
import { CalendarDays, ClipboardList, MoveRight, MessagesCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../context/EventProvider";

export default function Home () {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {events} = useEvent();
    const today = new Date();
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const getNextEvent = () => {

    }

    return (
        <div>
            <PageHeading 
                title={`Hallo, ${user.first_name} ${user.last_name}!`} 
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
                        Hier kommt der nächste Termin rein
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
