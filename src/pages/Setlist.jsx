import React, { useState, useEffect } from "react"
import { Form, ListMusic, Library, Plus, Trash, Coffee, Notebook, Download } from "lucide-react"
import { getStoredSetlists, saveStoredSetlists } from '../services/storageService'

import BasicTile from "../components/BasicTile/BasicTile";
import BasicButton from "../components/BasicButton/BasicButton";

export default function Setlist () {
    const [setlists, setSetLists] = useState([]);
    const [activeSetlist, setActiveSetlist] = useState(null);

    // Initial Page-Load: Load Data from Localstorage
    useEffect(() => {
        const loadedSetlists = getStoredSetlists();
        setSetLists(loadedSetlists);
    }, []);

    const handleCreateNewSetlist = () => {
        const newSetlist = {
            id: Date.now().toString(),
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
        const {name, value } = e.target

        const updatedActiveSetlist = {
            ...activeSetlist,
            [name]: value
        };
        setActiveSetlist(updatedActiveSetlist);

        setActiveSetlist(prev => ({
            ...prev,
            [name]: value
        }));

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
                    {/* Setlist-List */}
                    <BasicTile title="Setlists" icon={<ListMusic />}>
                            <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex flex-row flex-wrap items-center gap-2 ">
                                    {setlists.map((setlist) => (
                                        <div 
                                            key={setlist.id} 
                                            onClick={() => handleSelectSetlist(setlist)} 
                                            className={`p-2 rounded border border-line-accent hover:bg-surface hover:border-none ${activeSetlist?.id === setlist.id ? 'bg-line-accent' : ''}`}
                                        >
                                            <span className="text-sm ">{setlist.name}</span>
                                            <span className="ml-1">({setlist.songs.length})</span>
                                        </div>
                                    ))}
                                </div>
                            <button 
                                type="button"
                                onClick={handleCreateNewSetlist}
                                className="inline-flex items-center rounded justify-between gap-2 hover:bg-surface h-8 px-3"
                            >
                                <Plus className="h-4 w-4"/>
                                New Setlist
                            </button>
                        </div>
                    </BasicTile>
                    {/* Setlist-Details */}
                    <BasicTile>
                        {activeSetlist ? (
                        <div className="flex flex-col gap-4 p-4">
                            <div className="flex flex-row flex-wrap items-center gap-1.5">
                                <input 
                                    type="text" 
                                    value={activeSetlist.name}
                                    name = "name"
                                    onChange={handleInputChange}
                                    className="rounded-md border border-line px-3 test-sm h-10"  
                                />
                                <div>
                                    <span className="text-xs font-medium">Stagetime</span>
                                    <input 
                                        type="time"
                                        name="stageTime"
                                        value={activeSetlist.stageTime || ''}
                                        onChange={handleInputChange}
                                        className="rounded-md border border-line text-sm h-8 px-2 w-24"
                                    />
                                </div>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <BasicButton title="Export to PDF" icon={<Download />} />
                                    <BasicButton icon={<Trash />} onClick={() => handleDeleteActiveSetlist()}/>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="inline-flex items-center gap-1 rounded-md text-xs">Gesamt 0 min</span>
                                <div className="ml-auto inline-flex items-center gap-1.5">
                                   <BasicButton title="Block" icon={<Form />} />
                                   <BasicButton title="Note" icon={<Notebook />} />
                                   <BasicButton title="Break" icon={<Coffee />} />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                                Song-Bereich
                            </div>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                            Setlist auswählen
                        </div>
                        )}
                    </BasicTile>        
                </section>
                {/* Songs Section */}
                <section>
                    <BasicTile title="Song-Arcive" icon={<Library />}>
                        Song-Arcive
                    </BasicTile>
                </section>
            </div>
        </div>
    )
}


