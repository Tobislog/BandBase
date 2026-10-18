import React, { useState } from "react";
import { Library, Plus, Pen, Trash } from "lucide-react";
import BasicButton from "./BasicButton";
import BasicTile from "./BasicTile";
import SongItem from "./SongItem";

export default function SongLibrary ({ songs, onCreateSong, onAddSong, onEditSong, onDeleteSong}) {
    const [isSongdetailsVisible, setIsSongdetailsVisible] = useState(true);

    const handleShowSongDetais = () => {
        setIsSongdetailsVisible(!isSongdetailsVisible);
    }

    return (
        <BasicTile title="Song-Arcive" icon={<Library />}>
            <div className="flex justify-end border-b border-line p-2 h-12">
                <BasicButton title="Add Song" icon={<Plus />} onClick={onCreateSong} />
            </div>
            <div>
                {songs.map((song) => (
                    <SongItem 
                        key={song.id}
                        song={song}
                        onAddSong={onAddSong}
                        onEditSong={onEditSong}
                        onDeleteSong={onDeleteSong}
                    />
                ))}
            </div>
        </BasicTile>
    )
}
