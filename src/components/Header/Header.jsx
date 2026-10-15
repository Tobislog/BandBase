import { useState } from "react";
import { Menu, Music2 } from "lucide-react";

export default function Header () {
    return (
        <header className=" h-12 flex-none flex flex-row">
            <button type="button">
                <Menu className="w-6 h-6 hover:text-brand cursor-pointer"/>
            </button>
            <a href="/" className="flex flex-row">
                <span>
                    <Music2 className="w-6 h-6 bg-brand cursor-pointer"/>
                </span>
                <span className="">
                    BandBase
                </span>
            </a>
        </header>
    )
}
