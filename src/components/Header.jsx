import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import BasicButton from "./BasicButton";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

export default function Header () {
    const location = useLocation();
    const currentItem = NAV_ITEMS.find(item => item.path === location.pathname);
    const pageTitle = currentItem ? currentItem.title : 'BandBase'; // Fallback for non-existing Pages
    const navigate = useNavigate();

    const {user, logout} = useAuth();
    const initials = (user?.first_name.charAt(0) || '').toUpperCase() 
                        + (user?.last_name.charAt(0) || '').toUpperCase();

    const handleLogout = async () => {
        try{
            await logout();
            navigate('/login');

        } catch (err){
            console.error('Fehler beim Logout', err.message)
        }
    }
    return (
        <header className="h-12 flex flex-row items-center px-6 justify-between bg-line">
            <h1 className="text-lg font-semibold text-heading">{pageTitle}</h1>
            <div className="flex items-center gap-2">
                <div>{user.first_name} {user.last_name}</div>
                <div style={{ backgroundColor: user.color }} className="w-8 h-8 rounded-full flex items-center justify-center p-1">{initials}</div>
                <BasicButton title="logout" icon={<LogOut />} onClick={handleLogout}/>
            </div>
            
        </header>    
    )
}
