import { useState } from "react";
import { Menu, Music2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Header () {
    const location = useLocation();

    const getPageTitle = (pathname) => {
        switch(pathname) {
            
        }
    }

    return (
        <header className=" h-12 flex-none flex flex-row">
            This is the Header
        </header>
    )
}
