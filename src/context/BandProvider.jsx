import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getBands } from "../services/bandService";

const BandContext = createContext(null);

export function BandProvider ({children}) {
    const { user } = useAuth();
    const [bands, setBands] = useState([]);
    const [selectedBandId, setSelectedBandId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if(!user?.id) {
                if(!cancelled) {
                    setBands([]);
                    setSelectedBandId(null);
                    setError('');
                    setLoading(false);
                }
                return;
            }
            setLoading(true);
            setError('');

            try {
                const nextBands = await getBands();
                if (cancelled) return;

                setBands(nextBands);
                setSelectedBandId((current) => (
                    nextBands.some((band) => band.id === current) ? current : nextBands[0]?.id ?? null
                ));
            } catch (err) {
                if (cancelled) return;

                setBands([]);
                setSelectedBandId(null);
                setError(err.message || 'Bands loading error.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const activeBandId = bands.some((band) => band.id === selectedBandId) ? selectedBandId : bands[0]?.id ?? null;
    const memberships = useMemo(() => bands.map((band) => ({
        bandId: band.id,
        userId: user?.id ?? null,
        role: band.role,
        createdAt: band.joinedAt ?? band.createdAt,
    })), [bands, user?.id]);

    const band = useMemo(() => bands.find((item) => item.id === activeBandId) ?? null, [bands, activeBandId]);
    const membership = useMemo(() => memberships.find((item) => item.bandId === activeBandId) ?? null, [memberships, activeBandId]);
    const role = membership?.role ?? null;

    const value = useMemo(() => ({
        band,
        bands,
        activeBandId,
        setActiveBandId: setSelectedBandId,
        memberships,
        membership,
        role,
        isOwner: role === 'owner',
        isAdmin: role === 'admin' || role === 'owner',
        isModerator: role === 'moderator' || role === 'admin' || role === 'owner',
        canManage: ['owner', 'admin', 'moderator'].includes(role),
        loading,
        error
    }), [
        band,
        bands,
        activeBandId,
        memberships,
        membership,
        role,
        loading,
        error,        
    ]);

    return (
        <BandContext.Provider value={value}>
            {children}
        </BandContext.Provider>
    )

}

export function useBand() {
    const ctx = useContext(BandContext);
    if (!ctx) throw new Error("useBand must be used within a BandProvider");
    return ctx;
}
