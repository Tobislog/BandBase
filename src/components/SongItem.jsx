import React, { useState } from "react";

import BasicButton from "./BasicButton";
import { Plus, Trash, Pen } from "lucide-react";

export default function SongItem ({song, onAddSong, onDeleteSong}) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    return (
        <div className="flex flex-col justify center p-2 m-2 bg-surface rounded border border-line" >
                        <div className="flex flex-row justify-between items-center">
                            <p>{song.name}</p>
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
