import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-surface text-copy">
                <p>Lade Anwendung...</p>
            </div>
        )
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />
}
