import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css'

import Home from './pages/Home';
import Setlist from './pages/Home';
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'


function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex antialised bg-surface text-copy min-h-screen">
      <Sidebar isOpen={isSidebarOpen} />
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
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="setlist" element={<Setlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
