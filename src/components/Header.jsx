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
            <div>
                {user && <span>{user.email}</span>}
                <BasicButton title="logout" icon={<LogOut />} onClick={handleLogout}/>
            </div>
            
        </header>    
    )
}
