import { useState } from "react";

function Header () {
    return (
        <header>
            <button type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu preview-icon">
                    <path d="M4 5h16"/>
                    <path d="M4 12h16"/>
                    <path d="M4 19h16"/>
                </svg>
            </button>
            <a href="/">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music-2 preview-icon">
                        <circle cx="8" cy="18" r="4"/>
                        <path d="M12 18V2l7 4"/>
                    </svg>
                </span>
                <span>
                    BandBase
                </span>
            </a>
        </header>
    )
}

export default Header
