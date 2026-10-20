import React from "react";

export default function BasicTile ({children, title, icon}) {
    return (
        <div className="rounded-xl border border-line overflow-hidden bg-surface-accent">
            {title && (
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                        {/* Cloning the icon-Element for adding className-Attributes*/}
                        {icon && React.cloneElement(icon, {className: "h-4 w-4"})} 
                        {title}
                    </h2>
                </div>
            )}
            {children}
        </div>
    )
}
