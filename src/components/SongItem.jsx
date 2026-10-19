import { useState} from "react";
import BasicButton from "./BasicButton";
import SongItemOption from "./SongItemOption";
import { Plus, Trash, Pen } from "lucide-react";

export default function SongItem ({song, onAddSong, onEditSong, onDeleteSong}) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    const handleInputChange = (e) => {
        const {name, value } = e.target;
        const updatedSong = {
            ...song,
            [name]: value
        };
        onEditSong(updatedSong);
    }

    return (
        <div className="flex flex-col gap-2 justify center p-2 m-2 bg-surface rounded border border-line" >
                        <div className="flex flex-row justify-between items-center">
                            <input 
                                type="text"
                                name="name" 
                                value={song.name} 
                                onChange={handleInputChange} 
                                disabled={!isDetailsVisible}
                                className={`border-line rounded disabled:border-line ${isDetailsVisible ? 'bg-surface-accent' : 'bg-surface'}`}
                                />
                            <div className="flex gap-2">
                                <BasicButton icon={<Plus />} onClick={() => onAddSong(song.id)} />
                                <BasicButton icon={<Pen />} onClick={() => setIsDetailsVisible(!isDetailsVisible)} />
                                <BasicButton icon={<Trash />} isDelete onClick={() => onDeleteSong(song.id)} />
                            </div>
                        </div>
                        {isDetailsVisible && (
                        <div className="flex flex-row gap-2">
                            <SongItemOption type="text" name="interpret" title="Interpret" onChange={handleInputChange}/>
                            <SongItemOption type="time" name="duration" title="Duration" onChange={handleInputChange}/>
                            <SongItemOption type="number" name="bpm" title="BPM" onChange={handleInputChange}/>
                        </div>
                        )}
                    </div>
    )
}
