import { Menu } from "lucide-react";
import SidebarLink from "./SidebarLink";
import { NAV_ITEMS } from "../config/navigation";

export default function Sidebar ( { isOpen, onToggle }) {

    return (
        <aside className={`flex flex-col gap-4 bg-surface-accent duration-300 ${ isOpen ? 'w-64' : 'w-18'}`}>
            <div className="flex flex-col gap-4 p-4">
                <div 
                    onClick={onToggle}
                    className="flex items-center p-2 rounded hover:bg-surface cursor-pointer"
                    title="Toggle Menu"
                >
                    <Menu />
                    {isOpen && <span className="ml-3">BandBase</span>}
                </div>
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

