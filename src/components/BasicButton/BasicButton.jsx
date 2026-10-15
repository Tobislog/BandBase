import React from "react";

export default function BasicButton ({ title, icon, onClick}) {
    return(
        <button 
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed border border-line hover:bg-surface-accent disabled:opacity-40 h-8 px-3 text-xs" 
        >
            {/* Cloning the icon-Element for adding a className */}
            {icon && React.cloneElement(icon, {className: "h-4 w-4, mr-1"})}
            {title}
        </button>
    )
}
