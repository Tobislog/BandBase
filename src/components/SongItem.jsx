import React, { useState, useEffect } from "react";
import BasicButton from "./BasicButton";
import { Plus, Trash, Pen } from "lucide-react";

import { getStoredSongs, saveStoredSongs } from '../services/storageService'

export default function SongItem ({song, onAddSong, onEditSong, onDeleteSong}) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    const handleInputChange = (e) => {
        const updatedSong = {
            ...song,
            name: e.target.value
        };
        onEditSong(updatedSong);
    }

    return (
        <div className="flex flex-col justify center p-2 m-2 bg-surface rounded border border-line" >
                        <div className="flex flex-row justify-between items-center">
                            <input 
                                type="text" 
                                value={song.name} 
                                onChange={handleInputChange} 
                                disabled={!isDetailsVisible}
                                className="border-line rounded disabled:border-line" 
                                />
                            <div className="flex gap-2">
                                <BasicButton icon={<Plus />} onClick={() => onAddSong(song.id)} />
                                <BasicButton icon={<Pen />} onClick={() => setIsDetailsVisible(!isDetailsVisible)} />
                                <BasicButton icon={<Trash />} isDelete onClick={() => onDeleteSong(song.id)} />
                            </div>
                        </div>
                        {isDetailsVisible && (
                            <div>
                                hier?
                            </div>
                        )}
                    </div>
    )
}
