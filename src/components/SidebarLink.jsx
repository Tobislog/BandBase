import React from "react";
import { Link } from "react-router-dom";

export default function SidebarLink ({ to, icon, text, isOpen}) {
    return (
        <Link
            to={to}
            className="flex items-center p-2 rounded hover:bg-surface transition-colors"
        >
            <span className="text-xl">{icon}</span>
            {isOpen && <span className="ml-3">{text}</span>}
        </Link>
    )
}
