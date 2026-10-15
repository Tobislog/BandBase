import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css'

import Home from './pages/Home';
import Setlist from './pages/Setlist';
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import { NAV_ITEMS } from './config/navigation';


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
        <main className="flex-1 overflow-x-hiden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {NAV_ITEMS.map((item) => (
            <Route 
              key={item.path}
              path={item.path === '/' ? undefined : item.path}
              index={item.path === '/'}
              element={item.component}
            />
          ))}
          <Route index element={<Home />} />
          <Route path="setlist" element={<Setlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
