import Home from "../pages/Home";
import Setlist from "../pages/Setlist";
import { HomeIcon, ListMusic } from "lucide-react";


export const NAV_ITEMS = [
    { path: '/', name: 'Home', icon: <HomeIcon />, component: <Home />, title: 'Home' },
    { path: '/setlist', name: 'Setlist', icon: <ListMusic />, component: <Setlist />, title: 'Setlists' }
];
