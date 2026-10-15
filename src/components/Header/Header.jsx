import { useState } from "react";
import { Menu, Music2 } from "lucide-react";

function Header () {
    return (
        <header>
            <button type="button">
                <Menu className="w-6 h-6 hover:text-brand cursor-pointer"/>
            </button>
            <a href="/">
                <span>
                    <Music2 className="w-6 h-6 hover:text-brand cursor-pointer"/>
                </span>
                <span className="">
                    BandBase
                </span>
            </a>
        </header>
    )
}

export default Header
