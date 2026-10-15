import React from "react";
import { Home, ListMusic, MessageCircle, Menu } from "lucide-react";
import SidebarLink from "../SidebarLink/SidebarLink";
import { NAV_ITEMS } from "../../config/navigation";

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
                {/* Go through NAV_ITEMS and generate SidebarLink-Items */}
                {NAV_ITEMS.map((item) => (
                    <SidebarLink
                        key={item.path}
                        to={item.path}
                        icon={item.icon}
                        text={item.name}
                        isOpen={isOpen}
                    />
                ))

                }
            </nav>
        </aside>
    )
}

export default Sidebar
