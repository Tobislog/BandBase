import { useState } from "react";
import { Home, ListMusic, MessageCircle } from "lucide-react";

function Sidebar () {

    return (
        <aside>
            <div>
                BandBase
            </div>
            <nav>
                <a href="/">
                    <Home />
                </a>
                <a href="/setlist">
                    <ListMusic />
                </a>
                <a href="/setlist">
                    <MessageCircle />
                </a>
            </nav>
        </aside>
    )
}

export default Sidebar
