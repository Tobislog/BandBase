import { ChevronDown, ChevronUp, Trash } from "lucide-react"
import BasicButton from "../../components/BasicButton"
import { formatDuration } from "../../utils/duration.js"

export default function SetlistSongItem ({
    item,
    song,
    canManage,
    isFirst,
    isLast,
    onDelete,
    onMoveUp,
    onMoveDown,
}) {
    const isSong = item.type === 'song';

    const label = isSong ? (song?.name ?? 'Unbekannter Song') : item.type === 'note' ? (item.text ?? 'Notiz') : 'Pause';
    const meta = isSong ? (song?.interpret ?? '') : item.type === 'note' ? 'Notiz' : 'Pause';
    const durationSeconds = isSong ? (song?.durationSeconds ?? 0) : item.type === 'pause' ? (item.durationSeconds ?? 0) : null;
    
    return (
        <div className="w-full flex flex-row items-center justify-between rounded bg-surface gap-2 p-2">
            <div className="min-w-0 flex-1 truncate">{label}</div>
            <div className="min-w-0 flex-1 truncate text-sm">{meta}</div>
            <div className="w-16 text-right text-sm">{durationSeconds === null ? '' : formatDuration(durationSeconds)}</div>
            {canManage && (
                <div className="flex items-center gap-1">
                    <BasicButton icon={<ChevronUp />} onClick={onMoveUp} disabled={isFirst}/>
                    <BasicButton icon={<ChevronDown />} onClick={onMoveDown} disabled={isLast}/>
                    <BasicButton icon={<Trash />} isDelete onClick={onDelete}/>
                </div>
            )}
        </div>
    )
}
