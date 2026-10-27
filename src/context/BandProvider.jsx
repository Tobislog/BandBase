import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getStoredMemberships, getStoredBands } from "../services/storageService";

const BandContext = createContext(null);

export function BandProvider ({children}) {
    const { user } = useAuth();
    const [activeBandId, setActiveBandId] =  useState(1); // Hard-Coded, later Multi-Band-Support
    const [memberships, setMemberships] = useState([]);
    const [bands, setBands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setBands(getStoredBands());

        if(!user?.id) {
            setMemberships([]);
            setLoading(false);
            return;
        }

        const allMemberships = getStoredMemberships();
        setMemberships(allMemberships.filter(m => m.userId === user.id));
        setLoading(false);
    }, [user?.id]);

    const band = bands.find(b => b.id === activeBandId) || { id: activeBandId, name:"Band_01", createdAt: "2026-10-27 12:27:00"};
    const membership = memberships.find(m => m.bandId === activeBandId) || null;
    const role = membership?.role || null;

    const isOwner = role === "owner";
    const isAdmin = role === "admin" || isOwner;
    const isModerator = role === "moderator" || isAdmin;
    const canManage = isModerator;

    return (
        <BandContext.Provider 
            value={{ 
                band,
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
