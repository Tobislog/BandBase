import BasicButton from "./BasicButton"
import { Trash } from "lucide-react"

export default function SetlistSongItem ({song, onDelete}) {
    return (
        <div className="w-full flex flex-row items-center justify-between rounded bg-surface gap-2 p-2">
            <div>{song.name}</div>
            <div>{song.interpret}</div>
            <div>{song.duration}</div>
            <BasicButton icon={<Trash />} isDelete onClick={() => onDelete(song.rowId)}/>
        </div>
    )
}
