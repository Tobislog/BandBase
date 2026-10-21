import { useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { NAV_ITEMS } from './config/navigation';

import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';



function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  return (
    <div className="flex antialised bg-surface text-copy min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Dynamic Page-Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/register" element={<Register />} /> */}

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {NAV_ITEMS.map((item) => (
                <Route 
                  key={item.path}
                  path={item.path === '/' ? undefined : item.path}
                  index={item.path === '/'}
                  element={item.component}
                />
              ))}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
