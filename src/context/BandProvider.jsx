import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getStoredMemberships, getStoredBands, saveStoredBands } from "../services/storageService";

const BandContext = createContext(null);

export function BandProvider ({children}) {
    const { user } = useAuth();
    const [activeBandId, setActiveBandId] =  useState(1); // Hard-Coded, later Multi-Band-Support
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bands] = useState(() => {
        const stored = getStoredBands();
        if (stored.length > 0) return stored;

        const seeded = [{
            id: 1,
            name: 'Band_01',
            createdAt: new Date().toISOString(),
        }]
        saveStoredBands(seeded);
        return seeded;
    });



    useEffect(() => {

        if(!user?.id) {
            setMemberships([]);
            setLoading(false);
            return;
        }

        const allMemberships = getStoredMemberships();
        setMemberships(allMemberships.filter(m => String(m.userId) === String(user.id)));
        setLoading(false);
    }, [user?.id]);

    const band = bands.find(b => String(b.id) === String(activeBandId)) ?? bands[0] ?? null;
    const membership = memberships.find(m => String(m.bandId) === String(activeBandId)) ?? null;
    const role = membership?.role || null;

    const isOwner = role === "owner";
    const isAdmin = role === "admin" || isOwner;
    const isModerator = role === "moderator" || isAdmin;
    const canManage = isModerator;

    return (
        <BandContext.Provider 
            value={{ 
                band,
                bands,
                activeBandId,
                setActiveBandId,
                memberships,
                membership,
                role,
                isOwner,
                isAdmin,
                isModerator,
                canManage,
                loading 
            }}>
            {children}
        </BandContext.Provider>
    )

}

export function useBand() {
    const ctx = useContext(BandContext);
    if (!ctx) throw new Error("useBand must be used within a BandProvider");
    return ctx;
}
