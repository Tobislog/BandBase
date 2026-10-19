import React, { useState, useEffect, act } from "react"
import { Form, ListMusic, Library, Plus, Trash, Coffee, Notebook, Download, Pen } from "lucide-react"
import { getStoredSetlists, saveStoredSetlists , getStoredSongs, saveStoredSongs } from '../services/storageService'

import BasicTile from "../components/BasicTile";
import BasicButton from "../components/BasicButton";
import SongLibrary from "../components/SongLibrary";
import SetlistSelector from "../components/SetlistSelector";
import SetlistDetail from "../components/SetlistDetail";

export default function Setlist () {
    const [setlists, setSetLists] = useState([]);
    const [activeSetlist, setActiveSetlist] = useState(null);

    const [songs, setSongs] = useState([]);

    // Initial Page-Load: Load Data from Localstorage
    useEffect(() => {
        const loadedSetlists = getStoredSetlists();
        setSetLists(loadedSetlists);
    }, []);
    useEffect(() => {
        const loadedSongs = getStoredSongs();
        setSongs(loadedSongs);
    }, []);

    // handler Setlist
    const handleCreateNewSetlist = () => {
        const newSetlist = {
            id: crypto.randomUUID(),
            name: 'Neue Setlist',
            stageTime: '20:00',
            songs: []
        };

        const updatedSetlists = [...setlists, newSetlist];
        setSetLists(updatedSetlists);
        saveStoredSetlists(updatedSetlists);
    }

    const handleSelectSetlist = (setlist) => {
        setActiveSetlist(setlist);
    }

    const handleDeleteActiveSetlist = () => {
        const updatedSetlists = setlists.filter(e => e.id !== activeSetlist.id);
        setSetLists(updatedSetlists);
        saveStoredSetlists(updatedSetlists);

        setActiveSetlist(null);
    }

    const handleInputChange = (e) => {
        if (!activeSetlist) return;
        const {name, value } = e.target;
        
        const updatedActiveSetlist = {
            ...activeSetlist,
            [name]: value
        };
        setActiveSetlist(updatedActiveSetlist);

        const updatedSetlists = setlists.map(setlist => setlist.id === activeSetlist.id ? updatedActiveSetlist : setlist);
        setSetLists(updatedSetlists);
        saveStoredSetlists(updatedSetlists);
    }

    // handler Songs
    const handleCreateNewSong = () => {
        const newSong = {
            id: crypto.randomUUID(),
            name: 'New Song',
            interpret: '',
            duration: 0,
            bpm: 0
        }

        const updatedSongList = [...songs, newSong];
        setSongs(updatedSongList);
        saveStoredSongs(updatedSongList);
    }

    const handleEditSong = (updatedSong) => {
        const updatedSongList = songs.map(s => s.id === updatedSong.id ? updatedSong : s);
        setSongs(updatedSongList);
        saveStoredSongs(updatedSongList);
    };
    
    const handleDeleteSong = (songId) => {
        const updatedSongList = songs.filter(s => s.id !== songId);
        setSongs(updatedSongList);
        saveStoredSongs(updatedSongList);

    }

    const handleAddSongToSetlist = (songId) => {
        if (!activeSetlist) return;

        const newSetlistEntry = {
            rowId: crypto.randomUUID(),
            songId: songId
        };

        const updatedActiveSetlist = {
            ...activeSetlist,
            songs: [...(activeSetlist.songs || []), newSetlistEntry]
        };
        setActiveSetlist(updatedActiveSetlist);

        const updatedSetlists = setlists.map(setlist => setlist.id === activeSetlist.id ? updatedActiveSetlist : setlist);
        setSetLists(updatedSetlists);
        saveStoredSetlists(updatedSetlists);
    }
    
    const handleDeleteSongFromSetlist = (rowId) => {
        if (!activeSetlist) return;
        const updatedActiveSetlist = {
            ...activeSetlist,
            songs: activeSetlist.songs.filter(item => item.rowId !== rowId)
        };
        setActiveSetlist(updatedActiveSetlist);
        const updatedSetlists = setlists.map(setlist => setlist.id === activeSetlist.id ? updatedActiveSetlist : setlist);
        setSetLists(updatedSetlists);
        saveStoredSetlists(updatedSetlists);


    }

    return (
        <div>
            {/* Page-Heading */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-heading">Setlist & Songarchiv</h1>
                    <p className="mt-1 text-sm ">Manage your Repertoire and Setlist-Database</p>
                </div>
            </div>
            {/* Page-Content */}
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
                {/* Setlist Section */}
                <section className="flex flex-col gap-4">
                    <SetlistSelector 
                        setlists={setlists}
                        activeSetlist={activeSetlist}
                        onSelect={handleSelectSetlist}
                        onCreate={handleCreateNewSetlist}
                    />
                    {/* Setlist-Details */}
                    <SetlistDetail 
                        activeSetlist={activeSetlist}
                        songs={songs}
                        onInputChange={handleInputChange}
                        onDeleteSong={handleDeleteSongFromSetlist}
                        onDelete={handleDeleteActiveSetlist}
                    />      
                </section>
                {/* Songs Section */}
                <section>
                    <SongLibrary 
                        songs={songs} 
                        onCreateSong={handleCreateNewSong}
                        onAddSong={handleAddSongToSetlist}
                        onEditSong={handleEditSong}
                        onDeleteSong={handleDeleteSong}    
                    />
                </section>
            </div>
        </div>
    )
}


