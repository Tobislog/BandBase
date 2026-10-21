import { Library, Plus } from "lucide-react";
import BasicButton from "../../components/BasicButton";
import BasicTile from "../../components/BasicTile";
import SongItem from "./SongItem";

export default function SongLibrary ({ songs, onCreateSong, onAddSong, onEditSong, onDeleteSong}) {

    return (
        <BasicTile title="Song-Arcive" icon={<Library />} button={<BasicButton title="Add Song" icon={<Plus />} onClick={onCreateSong}/>}>
            <div className="max-h-143 overflow-y-auto">
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
