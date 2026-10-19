import Home from "../pages/Home";
import Setlist from "../pages/Setlist";
import Messenger from "../pages/Messenger";
import { HomeIcon, ListMusic, MessagesCircle } from "lucide-react";


export const NAV_ITEMS = [
    { path: '/', name: 'Home', icon: <HomeIcon />, component: <Home />, title: 'Home' },
    { path: '/setlist', name: 'Setlists', icon: <ListMusic />, component: <Setlist />, title: 'Setlists' },
    { path: '/chat', name: 'Messages', icon: <MessagesCircle />, component: <Messenger />, title: 'Messages' },
    
];
