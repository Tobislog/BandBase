import { useState} from "react";
import BasicButton from "../../components/BasicButton";
import SongItemOption from "./SongItemOption";
import { Plus, Trash, Pen } from "lucide-react";
import{ formatDuration, parseDuration } from "../../utils/duration.js"

export default function SongItem ({
    song,
    canManage, 
    onAddSong, 
    onEditSong, 
    onDeleteSong,
    onError,
}) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(!canManage);
    const [name, setName] = useState(song.name);
    const [interpret, setInterpret] = useState(song.interpret ?? '');
    const [durationText, setDurationText] = useState(formatDuration(song.durationSeconds));
    const [bpm, setBpm] = useState(String(song.bpm ?? 0));

    const reset = () => {
        setName(song.name);
        setInterpret(song.interpret ?? '');
        setDurationText(formatDuration(song.durationSeconds));
        setBpm(String(song.bpm ?? 0));
    };

    const save = async () => {
        if (!canManage) return;

        const nextName = name.trim();
        if (!nextName) {
            onError?.('Song name required');
            reset();
            return;
        }

        const durationSeconds = parseDuration(durationText);
        if (durationSeconds === null) {
            onError?.('Duration must be MM:SS');
            reset();
            return;
        }

        const nextBpm = Number(bpm);
        if (!Number.isInteger(nextBpm) ||nextBpm < 0) {
            onError?.('BPM must be a non-negative integer');
            reset();
            return;
        }

        const saved = await onEditSong({
            ...song,
            name: nextName,
            interpret: interpret.trim(),
            durationSeconds,
            bpm: nextBpm,
        });

        if (!saved) {
            reset();
            return;
        }

        setName(saved.name);
        setInterpret(saved.interpret ?? '');
        setDurationText(formatDuration(saved.durationSeconds));
        setBpm(String(saved.bpm ?? 0));
    };

    return (
        <div className="flex flex-col gap-2 justify center p-2 m-2 bg-surface rounded border border-line" >
            <div className="flex flex-row justify-between items-center">
                <input 
                    type="text"
                    name="name" 
                    value={name} 
                    onChange={(event) => setName(event.target.value)} 
                    onBlur={save}
                    disabled={!canManage}
                    className={`border-line rounded disabled:border-line ${isDetailsVisible ? 'bg-surface-accent' : 'bg-surface'}`}
                    />
                <div className="flex gap-2">
                    {canManage && (<BasicButton icon={<Plus />} onClick={() => onAddSong(song.id)} />)}
                    {canManage && (<BasicButton icon={<Pen />} onClick={() => setIsDetailsVisible((current) => !current)} />)}
                    {canManage && (<BasicButton icon={<Trash />} isDelete onClick={() => onDeleteSong(song.id)} />)}
                </div>
            </div>
            {isDetailsVisible && (
            <div className="flex flex-row gap-2">
                <SongItemOption 
                    type="text" 
                    name="interpret" 
                    title="Interpret" 
                    value={interpret} 
                    onChange={(event) => setInterpret(event.target.value)}
                    onBlur={save}
                    disabled={!canManage}
                />
                <SongItemOption 
                    type="text" 
                    name="duration" 
                    title="Duration (MM:SS)" 
                    value={durationText} 
                    onChange={(event) => setDurationText(event.target.value)}
                    onBlur={save}
                    disabled={!canManage}    
                />
                <SongItemOption 
                    type="number" 
                    name="bpm" 
                    title="BPM" 
                    value={bpm}
                    onChange={(event) => setBpm(event.target.value)}
                    onBlur={save}
                    disabled={!canManage}
                />
            </div>
            )}
        </div>
    );
}
