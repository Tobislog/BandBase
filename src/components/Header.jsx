import React from "react";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import BasicButton from "./BasicButton";
import { LogIn } from "lucide-react";

export default function Header () {
    const location = useLocation();

    const currentItem = NAV_ITEMS.find(item => item.path === location.pathname);

    const pageTitle = currentItem ? currentItem.title : 'BandBase'; // Fallback for non-existing Pages

    return (
        <header className="h-12 flex flex-row items-center px-6 justify-between bg-line">
            <h1 className="text-lg font-semibold text-heading">{pageTitle}</h1>
            <BasicButton title="login" icon={<LogIn />}/>
        </header>
    )
}
