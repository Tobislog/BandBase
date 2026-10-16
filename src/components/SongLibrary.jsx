import React from "react";
import { Library, Plus, Pen, Trash } from "lucide-react";
import BasicButton from "./BasicButton";
import BasicTile from "./BasicTile";

export default function SongLibrary ({ songs, onCreateSong, onAddSong, onDeleteSong}) {
    return (
        <BasicTile title="Song-Arcive" icon={<Library />}>
            <div className="flex justify-end border-b border-line p-2 h-12">
                <BasicButton title="Add Song" icon={<Plus />} onClick={onCreateSong} />
            </div>
            <div>
                {songs.map((song) => (
                    <div 
                        key={song.id}
                        className="flex items-center justify-between p-2 m-2 bg-surface rounded border border-line"
                    >
                        <div>
                            {song.name}
                        </div>
                        <div className="flex gap-2">
                            <BasicButton icon={<Plus />} onClick={() => onAddSong(song.id)}/>
                            <BasicButton icon={<Pen />}/>
                            <BasicButton icon={<Trash />} isDelete onClick={() => onDeleteSong(song.id)}/>
                        </div>
                    </div>
                ))}
            </div>
        </BasicTile>
    )
}
