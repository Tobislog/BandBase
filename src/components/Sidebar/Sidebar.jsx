import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, ListMusic, MessageCircle, Menu } from "lucide-react";

import SidebarLink from "../SidebarLink/SidebarLink";

function Sidebar ( { isOpen, onToggle }) {

    return (
        <aside className={`flex flex-col gap-4 bg-surface-accent tansition-all duration-300 ${ isOpen ? 'w-64' : 'w-20'}`}>
            <div 
                onClick={onToggle}
                className="flex flex-row gap-4 p-6"
                title="Toggle Menu"
            >
                <Menu />
                {isOpen && <span>BandBase</span>}
            </div>
            <nav className="flex flex-col gap-4 p-4">
                <SidebarLink to="/" icon={<Home />} text="Home" isOpen={isOpen} />
                <SidebarLink to="/setlist" icon={<ListMusic />} text="Setlist" isOpen={isOpen}/>
                <SidebarLink to="/setlist" icon={<MessageCircle />} text="Messages" isOpen={isOpen}/>
            </nav>
        </aside>
    )
}

export default Sidebar
