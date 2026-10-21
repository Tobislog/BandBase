import { Trash, Form, Notebook, Coffee, Download } from "lucide-react";
import BasicTile from "../../components/BasicTile";
import BasicButton from "../../components/BasicButton";
import SetlistSongItem from "./SetlistSongItem";

export default function SetlistDetail ({ activeSetlist, songs, onInputChange, onDeleteSong, onDelete}) {
    
    if (!activeSetlist) {
        return (
            <BasicTile>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                    Setlist auswählen
                </div>
            </BasicTile>
        )
    }
    
    const setlistSongs = activeSetlist.songs.map((entry) => {
        const song = songs.find((e) => e.id === entry.songId);
        return {
            ...song,
            rowId: entry.rowId
        };
    });

    const totalSeconds = setlistSongs.reduce((acc, song) => {
        if (!song.duration || typeof song.duration !== 'string') return acc;

        const [minutes, seconds] = song.duration.split(":").map(Number);
        const songSeconds = (minutes || 0) * 60 + (seconds || 0);

        return acc + songSeconds;
    }, 0);
    
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds / 60) % 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedTotalDuration = `${totalHours}h ${totalMinutes} min ${remainingSeconds}s`

    return (
        <BasicTile>
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-row flex-wrap items-center gap-1.5">
                    <input 
                        type="text" 
                        value={activeSetlist.name}
                        name = "name"
                        onChange={onInputChange}
                        className="rounded-md border border-line px-3 text-sm h-10"  
                    />
                    <div>
                        <span className="text-xs font-medium">Stagetime</span>
                        <input 
                            type="time"
                            name="stageTime"
                            value={activeSetlist.stageTime || ''}
                            onChange={onInputChange}
                            className="rounded-md border border-line text-sm ml-2 h-8 px-2 w-24"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <BasicButton title="Export to PDF" icon={<Download />} />
                        <BasicButton icon={<Trash />} isDelete onClick={onDelete}/>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md text-xs">Gesamt {formattedTotalDuration}</span>
                    <div className="ml-auto inline-flex items-center gap-1.5">
                        <BasicButton title="Block" icon={<Form />} />
                        <BasicButton title="Note" icon={<Notebook />} />
                        <BasicButton title="Break" icon={<Coffee />} />
                    </div>
                </div>
                <div className="max-h-100 overflow-y-auto flex flex-col items-stretch justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-center">
                    {(activeSetlist.songs.length > 0) ? (
                        setlistSongs.map((song) => (
                            <SetlistSongItem
                                key={song.rowId}
                                song={song}
                                onDelete={onDeleteSong}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-4 text-center">
                            Keine Songs vorhanden
                        </div>
                    )}
                </div>
            </div>
        </BasicTile>
    )
}
