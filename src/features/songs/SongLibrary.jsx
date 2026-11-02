import { Library, Plus } from "lucide-react";
import BasicButton from "../../components/BasicButton";
import BasicTile from "../../components/BasicTile";
import SongItem from "./SongItem";

export default function SongLibrary ({ 
    songs,
    canManage,
    onCreateSong, 
    onAddSong, 
    onEditSong, 
    onDeleteSong,
    onError,
}) {
    return (
        <BasicTile 
            title="Song-Arcive" 
            icon={<Library />} 
            button={canManage ? (
                <BasicButton 
                    title="Add Song" 
                    icon={<Plus />} 
                    onClick={onCreateSong}
                />
            ) : null }
        >
            <div className="max-h-143 overflow-y-auto">
                {songs.map((song) => (
                    <SongItem 
                        key={song.id}
                        song={song}
                        canManage={canManage}
                        onAddSong={onAddSong}
                        onEditSong={onEditSong}
                        onDeleteSong={onDeleteSong}
                        onError={onError}
                    />
                ))}
            </div>
        </BasicTile>
    )
}
