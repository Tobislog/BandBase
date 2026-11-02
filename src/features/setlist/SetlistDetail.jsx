import { useState } from "react";
import { Trash, Form, Notebook, Coffee, Download } from "lucide-react";
import BasicTile from "../../components/BasicTile";
import BasicButton from "../../components/BasicButton";
import SetlistSongItem from "./SetlistSongItem";
import { formatDuration, parseDuration } from "../../utils/duration.js"

export default function SetlistDetail ({ 
    activeSetlist, 
    songs,
    canManage,
    onUpdateSetlist,
    onDeleteItem,
    onMoveItem,
    onDeleteSetlist,
    onAddNote,
    onAddPause,
    onError 
}) {
    const [name, setName] = useState(activeSetlist?.name ?? '');
    const [stageTime, setStageTime] = useState(activeSetlist?.stageTime ?? '');
    
    if (!activeSetlist) {
        return (
            <BasicTile>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                    Setlist auswählen
                </div>
            </BasicTile>
        )
    }
    
    const items = activeSetlist.items ?? [];

    const saveFields = async () => {
        const nextName = name.trim();

        if(!nextName) {
            onError?.('Setlist name required');
            setName(activeSetlist.name);
            return;
        }

        const updated = await onUpdateSetlist({
            name: nextName,
            stageTime: stageTime || null,
        });

        if (!updated) {
            setName(activeSetlist.name);
            setStageTime(activeSetlist.stageTime ?? '');
            return;
        }

        setName(updated.name);
        setStageTime(updated.stageTime ?? '');
    }

    const handleAddNote = async () => {
        if (!canManage) return;

        const value = window.prompt('Notiz');
        if (value === null) return;

        const text = value.trim();
        if (!text) {
            onError?.('Notiztext erforderlich');
            return;
        }
        if (text.length > 2000) {
            onError?.('Notiz darf maximal 2000 Zeichen enthalten');
            return;
        }

        await onAddNote(text);
    };

    const handleAddPause = async () => {
        if (!canManage) return;

        const value = window.prompt('Pause (MM:SS)');
        if (value === null) return;

        const durationSeconds = parseDuration(value);
        if (durationSeconds === null) {
            onError?.('Pause muss im Format MM:SS angegeben werden');
            return;
        }

        await onAddPause(durationSeconds);
    };

    const totalSeconds = items.reduce((total, item) => {
        if (item.type === 'song') {
            const song = songs.find((entry) => entry.id === item.songId);
            return total + (song?.durationSeconds ?? 0);
        }
        if (item.type === 'pause') {
            return total + (item.durationSeconds ?? 0);
        }
        return total;
    }, 0);
    
    return (
        <BasicTile>
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-row flex-wrap items-center gap-1.5">
                    <input 
                        type="text" 
                        value={name}
                        name = "name"
                        onChange={(event) => setName(event.target.value)}
                        onBlur={saveFields}
                        disabled={!canManage}
                        className="rounded-md border border-line px-3 text-sm h-10"  
                    />
                    <div>
                        <span className="text-xs font-medium">Stagetime</span>
                        <input 
                            type="time"
                            name="stageTime"
                            value={stageTime}
                            onChange={(event) => setStageTime(event.target.value)}
                            onBlur={saveFields}
                            disabled={!canManage}
                            className="rounded-md border border-line text-sm ml-2 h-8 px-2 w-24"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <BasicButton title="Export to PDF" icon={<Download />} />
                        {canManage && (
                            <BasicButton 
                                icon={<Trash />} 
                                isDelete 
                                onClick={onDeleteSetlist}
                            />
                        )}
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md text-xs">Gesamt {formatDuration(totalSeconds)}</span>
                    {canManage && (
                        <div className="ml-auto inline-flex items-center gap-1.5">
                            <BasicButton title="Block" icon={<Form />} disabled/>
                            <BasicButton title="Note" icon={<Notebook />} onClick={handleAddNote}/>
                            <BasicButton title="Break" icon={<Coffee />} onClick={handleAddPause}/>
                        </div>
                    )}
                </div>

                <div className="max-h-100 overflow-y-auto flex flex-col items-stretch justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-center">
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const song = item.type === 'song' ? songs.find((entry) => entry.id === item.songId) ?? null : null;
                            return (
                                <SetlistSongItem
                                    key={item.id}
                                    item={item}
                                    song={song}
                                    canManage={canManage}
                                    isFirst={index === 0}
                                    isLast={index === items.length -1}
                                    onDelete={() => onDeleteItem(item.id)}
                                    onMoveUp={() => onMoveItem(item.id, -1)}
                                    onMoveDown={() => onMoveItem(item.id, 1)}
                                />
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-4 text-center">
                            Keine Items vorhanden
                        </div>
                    )}
                </div>
            </div>
        </BasicTile>
    )
}
