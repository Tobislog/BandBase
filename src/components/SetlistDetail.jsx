import React from "react";
import { Trash, Form, Notebook, Coffee, Download } from "lucide-react";
import BasicTile from "./BasicTile";
import BasicButton from "./BasicButton";

export default function SetlistDetail ({ activeSetlist, onInputChange, onDelete}) {

    return (
        <BasicTile>
            {activeSetlist ? (
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-row flex-wrap items-center gap-1.5">
                    <input 
                        type="text" 
                        value={activeSetlist.name}
                        name = "name"
                        onChange={onInputChange}
                        className="rounded-md border border-line px-3 test-sm h-10"  
                    />
                    <div>
                        <span className="text-xs font-medium">Stagetime</span>
                        <input 
                            type="time"
                            name="stageTime"
                            value={activeSetlist.stageTime || ''}
                            onChange={onInputChange}
                            className="rounded-md border border-line text-sm h-8 px-2 w-24"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <BasicButton title="Export to PDF" icon={<Download />} />
                        <BasicButton icon={<Trash />} isDelete onClick={onDelete}/>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md text-xs">Gesamt 0 min</span>
                    <div className="ml-auto inline-flex items-center gap-1.5">
                        <BasicButton title="Block" icon={<Form />} />
                        <BasicButton title="Note" icon={<Notebook />} />
                        <BasicButton title="Break" icon={<Coffee />} />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                    Song-Bereich
                </div>
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                Setlist auswählen
            </div>
            )}
        </BasicTile>
    )
}
