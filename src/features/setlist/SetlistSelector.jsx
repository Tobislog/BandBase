import React from "react";
import { ListMusic, Plus } from "lucide-react";
import BasicTile from "../../components/BasicTile";
import BasicButton from "../../components/BasicButton";

export default function SetlistSelector ({ setlists, activeSetlist, onSelect, onCreate }) {

    return (
        <BasicTile title="Setlists" icon={<ListMusic />} button={<BasicButton title="Setlist" icon={<Plus />} onClick={onCreate}/>}>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-row flex-wrap items-center gap-2 ">
                    {setlists.map((setlist) => (
                        <div 
                            key={setlist.id} 
                            onClick={() => onSelect(setlist)} 
                            className={`p-2 rounded border border-line-accent cursor-pointer hover:bg-surface hover:border-none ${activeSetlist?.id === setlist.id ? 'bg-line-accent' : ''}`}
                        >
                            <span className="text-sm ">{setlist.name}</span>
                            <span className="ml-1">({setlist.songs.length})</span>
                        </div>
                    ))}
                </div>
            </div>
        </BasicTile>
    )
}
