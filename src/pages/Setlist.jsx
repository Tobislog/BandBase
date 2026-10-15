import React, { useState, useEffect } from "react"
import { ListMusic, Plus } from "lucide-react"
import { getStoredSetlists, saveStoredSetlists } from '../services/storageService'

export default function Setlist () {
    const [setlists, setSetLists] = useState([]);

    // Initial Page-Load: Load Data from Localstorage
    useEffect(() => {
        const loadedSetlists = getStoredSetlists();
        setSetLists(loadedSetlists);
    }, []);

    const handleCreateNewSetlist = () => {
        const newSetlist = {
            id: Date.now().toString(),
            name: 'Neue Setlist',
            songs: []
        };

        const updatedSetlists = [...setlists, newSetlist];
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

                    <div className="rounded-xl border border-line bg-surface-accent">
                        <div className="flex items-center justify-between border-b border-line px-4 py-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                                <ListMusic className="h-4 w-4" />
                                Setlists
                            </h2>
                        </div>
                        {/* Setlists-list */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex flex-row items-center gap-2 ">
                                {setlists.map((setlist) => (
                                    <div key={setlist.id} className="p-2 rounded border border-line-accent hover:bg-surface hover:border-none" >
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
                    </div>

                    <div>
                        Weiteres Modul
                    </div>         
                </section>
                {/* Songs Section */}
                <section>
                    <div>
                    </div>
                </section>
            </div>
        </div>
    )
}


