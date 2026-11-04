import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { getRegistrationStatus } from "../services/settingsService";

const DEMO_EMAIL = 'demo-user@demo-mail.de';
const DEMO_PASSWORD = 'demouser';

export default function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [registrationEnabled, setRegistrationEnabled] = useState(true);
    const [demoLoading, setDemoLoading] = useState(false);
    const navigate = useNavigate();
    
    const { login } = useAuth();

    useEffect(() => {
        let cancelled = false;

        getRegistrationStatus()
            .then((enabled) => {
                if (!cancelled) setRegistrationEnabled(enabled);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/');

        } catch (err) {
            setError(err.message);
        }
    };

    const handleDemoLogin = async () => {
        setError('');
        setDemoLoading(true);

        try {
            await login(DEMO_EMAIL, DEMO_PASSWORD);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setDemoLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Einloggen
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">oder</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full py-2 px-4 border border-blue-600 text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {demoLoading ? 'Demo-Login läuft…' : 'Als Demo-Benutzer anmelden'}
        </button>
        {registrationEnabled && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Noch kein Konto? <Link to="/register" className="text-blue-600 hover:underline">Registrieren</Link>
          </p>
        )}
      </div>
    </div>
    )


}
