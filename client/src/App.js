import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './styles.css';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import ProspectDetail from './pages/ProspectDetail';
import Pipeline from './pages/Pipeline';
import Aircraft from './pages/Aircraft';
import Contacts from './pages/Contacts';
import Activities from './pages/Activities';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <span className="logo">✈️</span>
        <div>
          <h1>JetSales</h1>
          <div className="subtitle">Aviation CRM</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Overview</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/pipeline" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">🔄</span> Pipeline
        </NavLink>

        <div className="nav-section">Sales</div>
        <NavLink to="/prospects" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">🎯</span> Prospects
        </NavLink>
        <NavLink to="/contacts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">👤</span> Contacts
        </NavLink>
        <NavLink to="/activities" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">📋</span> Activities
        </NavLink>

        <div className="nav-section">Inventory</div>
        <NavLink to="/aircraft" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="icon">🛩️</span> Aircraft
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prospects" element={<Prospects />} />
            <Route path="/prospects/:id" element={<ProspectDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/aircraft" element={<Aircraft />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/activities" element={<Activities />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
