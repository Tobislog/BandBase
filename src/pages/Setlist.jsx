import { useState, useEffect } from "react"
import PageHeading from "../components/PageHeading";
import SongLibrary from "../features/songs/SongLibrary";
import SetlistSelector from "../features/setlist/SetlistSelector";
import SetlistDetail from "../features/setlist/SetlistDetail";
import { useBand } from "../context/BandProvider";
import { createSong, deleteSong, getSongs, updateSong} from "../services/songService.js";
import { createItem, createSetlist, deleteItem, deleteSetlist, getSetlists, updateSetlist, reorderSetlist } from "../services/setlistService.js"

export default function Setlist () {
    const { activeBandId, canManage } = useBand();

    const [setlists, setSetlists] = useState([]);
    const [activeSetlistId, setActiveSetlistId] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!activeBandId) {
                if (cancelled) return;
                setSetlists([]);
                setSongs([]);
                setActiveSetlistId(null);
                setError('');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');

            try {
                const [nextSetlists, nextSongs] = await Promise.all([
                    getSetlists(activeBandId),
                    getSongs(activeBandId),
                ]);

                if (cancelled) return;

                setSetlists(nextSetlists);
                setSongs(nextSongs);
                setActiveSetlistId((current) => (
                    nextSetlists.some((setlist) => setlist.id === current) ? current : nextSetlists[0]?.id ?? null
                ));
            } catch (err) {
                if (cancelled) return;
                setSetlists([]);
                setSongs([]);
                setActiveSetlistId(null);
                setError(err.message || 'Setlists konnten nicht geladen werden.');  
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();

        return () => {
            cancelled = true;
        };
    }, [activeBandId]);

    const activeSetlist = setlists.find((setlist) => setlist.id === activeSetlistId) ?? null;

    const replaceSetlist = (updatedSetlist) => {
        setSetlists((current) => current.map((setlist) => {
            return setlist.id === updatedSetlist.id ? updatedSetlist : setlist
        }));
    };

    const refreshSetlists = async () => {
        if (!activeBandId) return;

        const nextSetlists = await getSetlists(activeBandId);
        setSetlists(nextSetlists);
        setActiveSetlistId((current) => (nextSetlists.some((setlist) => setlist.id === current) ? current : nextSetlists[0]?.id ?? null));
    };

    // handler Setlist
    const handleCreateNewSetlist = async () => {
        if (!canManage || !activeBandId) return;

        try {
            setError('');
            const created = await createSetlist(activeBandId, {
                name: 'Neue Setlist',
            });
            setSetlists((current) => [...current, created]);
            setActiveSetlistId(created.id);
        } catch (err) {
            setError(err.message || 'Setlist konnte nicht angelegt werden.');
        }
    }
    
    const handleSelectSetlist = (setlist) => {
        setError('');
        setActiveSetlistId(setlist.id);
    }

    const handleDeleteActiveSetlist = async () => {
        if (!canManage || !activeSetlist) return;

        try {
            setError('');
            await deleteSetlist(activeSetlist.id);

            const remaining = setlists.filter((setlist) => setlist.id !== activeSetlist.id);
            setSetlists(remaining);
            setActiveSetlistId(remaining[0]?.id ?? null);
        } catch (err) {
            setError(err.message || 'Setlist konnte nicht gelöscht werden.');
        }
    };

    const handleUpdateActiveSetlist = async (patch) => {
        if (!canManage || !activeSetlist) return null;

        try {
            setError('');
            const updated = await updateSetlist(activeSetlist.id, {
                name: patch.name,
                stageTime: patch.stageTime,
            });
            replaceSetlist(updated);
            return updated;
        } catch (err) {
            setError(err.message || 'Setlist konnte nicht gespeichert werden.');
            return null;
        }
    };

    // handler Songs
    const handleCreateNewSong = async () => {
        if (!canManage || !activeBandId) return;

        try {
            setError('');
            const created = await createSong(activeBandId, {
                name: 'New Song',
            });
            setSongs((current) => [...current, created]);
        } catch (err) {
            setError(err.message || 'Song konnte nicht angelegt werden.');
        }
    };

    const handleEditSong = async (updatedSong) => {
        if (!canManage) return null;

        try {
            setError('');
            const saved = await updateSong(updatedSong.id, {
                name: updatedSong.name,
                interpret: updatedSong.interpret,
                durationSeconds: updatedSong.durationSeconds,
                bpm: updatedSong.bpm,
            });
            setSongs((current) => current.map((song) => (song.id ===saved.id ? saved : song)));
            return saved;
        } catch (err) {
            setError(err.message || 'Song konnte nicht gespeichert werden.');
            return null;
        }
    };
    
    const handleDeleteSong = async (songId) => {
        if (!canManage || !activeBandId) return;
        try {
            setError('');
            await deleteSong(songId);
            setSongs((current) => current.filter((song) => song.id !== songId));
            await refreshSetlists();
        } catch (err) {
            setError(err.message || 'Song konnte nicht gelöscht werden.');
        }
    };

    const appendItem = (setlistId, item) => {
        setSetlists((current) => current.map((setlist) => (
            setlist.id === setlistId
                ? { ...setlist, items: [...(setlist.items ?? []), item] }
                : setlist
        )));
    };

    const handleAddSongToSetlist = async (songId) => {
        if (!canManage || !activeSetlist) return;
        
        try {
            setError('');
            const item = await createItem(activeSetlist.id, {
                type: 'song',
                songId,
            });
            appendItem(activeSetlist.id, item);
        } catch (err) {
            setError(err.message || 'Song konnte nicht hinzugefügt werden.')
        }
    };

    const handleAddNote = async (text) => {
        if(!canManage || !activeSetlist) return;

        try {
            setError('');
            const item = await createItem(activeSetlist.id, {
                type: 'note',
                text,
            });
            appendItem(activeSetlist.id, item);
        } catch (err) {
            setError(err.message || 'Notiz konnte nicht hinzugefügt werden.');
        }
    };

    const handleAddPause = async (durationSeconds) => {
        if (!canManage || !activeSetlist) return;

        try {
            setError('');
            const item = await createItem(activeSetlist.id, {
                type: 'pause',
                durationSeconds,
            });
            appendItem(activeSetlist.id, item);
        } catch (err) {
            setError(err.message || 'Pause konnte nicht hinzugefügt werden.')
        }
    }
    
    const handleDeleteItem = async (itemId) => {
        if (!canManage || !activeSetlist) return;
    
        try {
            setError('');
            const items = await deleteItem(activeSetlist.id, itemId);
            setSetlists((current) => current.map((setlist) => (setlist.id === activeSetlist.id ?  {...setlist, items} : setlist)));
        } catch (err) {
            setError(err.message || ('Item konnte nicht gelöscht werden.'))
        }
    };

    const handleMoveItem = async (itemId, direction) => {
        if (!canManage || !activeSetlist) return;

        const itemIds = activeSetlist.items.map((item) => item.id);
        const index = itemIds.indexOf(itemId);
        const targetIndex = index + direction;

        if (index < 0 || targetIndex < 0 || targetIndex >= itemIds.length) return;

        [itemIds[index], itemIds[targetIndex]] = [itemIds[targetIndex], itemIds[index]];

        try {
            setError('');
            const items = await reorderSetlist(activeSetlist.id, itemIds);
            setSetlists((current) => current.map((setlist) => (setlist.id === activeSetlist.id ? {...setlist, items} : setlist)));
        } catch (err) {
            setError(err.message || 'Reihenfolge konnte nicht gespeichert werden.');
        }
    };

    return (
        <div>
            <PageHeading 
                title="Setlist & Songarchiv"
                subtitle="Manage your Repertoire and Setlist-Database"
            />
            {error && (
                <div className="mb-4 rounded-md border border-red-500/40 bg-red-400/10 px-3 py-2 text-sm text-red-500">{error}</div>
            )}
            {loading ? (
                <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm">Lade Setlists und Songs...</div>
            ) : (
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <section className="flex flex-col gap-4">
                        <SetlistSelector 
                            setlists={setlists}
                            activeSetlist={activeSetlist}
                            canManage={canManage}
                            onSelect={handleSelectSetlist}
                            onCreate={handleCreateNewSetlist}
                        />
                        <SetlistDetail
                            key={activeSetlist?.id ?? 'empty'} 
                            activeSetlist={activeSetlist}
                            songs={songs}
                            canManage={canManage}
                            onUpdateSetlist={handleUpdateActiveSetlist}
                            onDeleteItem={handleDeleteItem}
                            onMoveItem={handleMoveItem}
                            onDeleteSetlist={handleDeleteActiveSetlist}
                            onAddNote={handleAddNote}
                            onAddPause={handleAddPause}
                            onError={setError}
                        />      
                    </section>
                    <section>
                        <SongLibrary 
                            songs={songs} 
                            canManage={canManage}
                            onCreateSong={handleCreateNewSong}
                            onAddSong={handleAddSongToSetlist}
                            onEditSong={handleEditSong}
                            onDeleteSong={handleDeleteSong} 
                            onError={setError}   
                        />
                    </section>
                </div>
            )}
        </div>
    );
}


