import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import CopyGenerator from './pages/CopyGenerator';
import MetricsAnalysis from './pages/MetricsAnalysis';
import CampaignStructure from './pages/CampaignStructure';
import BudgetCalculator from './pages/BudgetCalculator';
import Academy from './pages/Academy';
import SystemHub from './pages/SystemHub';
import AdAnalyzer from './pages/AdAnalyzer';
import ManyChatBuilder from './pages/ManyChatBuilder';
import BusinessCoach from './pages/BusinessCoach';

// Layout Component
const AppLayout = ({ children }) => {
    const { role, signOut } = useAuth();

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    Smart Ads <span>OS</span>
                </div>

                <div style={{ marginBottom: '2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Modo Actual:</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase' }}>{role}</p>
                </div>

                <ul className="nav-links" style={{ flex: 1 }}>
                    <li className="nav-item">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>🚀 Panel de Control</Link>
                    </li>

                    {/* Client Role CANNOT see the internal tools */}
                    {role !== 'client' && (
                        <>
                            <li className="nav-item mt-4" style={{ marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>🔵 Smart Ads Lab</span>
                            </li>
                            <li className="nav-item">
                                <Link to="/coach" style={{ textDecoration: 'none', color: 'inherit', display: 'block', fontWeight: 'bold', color: 'white' }}>🧠 Smart Business Coach</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/copy-builder" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>✍️ Generador de Activos</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/analyzer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>👁️ Visual Ad Analyzer</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/budget" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>💰 Simulador de Negocio</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/structure" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>🏗️ Arquitectura Algorítmica</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/manychat" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>🤖 Automations Builder</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/metrics" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>👩‍⚕️ Diagnóstico Estratégico</Link>
                            </li>

                            <li className="nav-item mt-4" style={{ marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>🟣 Smart Ads Academy</span>
                            </li>
                            <li className="nav-item">
                                <Link to="/academy" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>🎓 Aprende Meta Ads</Link>
                            </li>

                            <li className="nav-item mt-4" style={{ marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>🟢 Smart Ads System</span>
                            </li>
                            <li className="nav-item">
                                <Link to="/system" style={{ textDecoration: 'none', color: 'inherit', display: 'block', opacity: 0.7 }}>⚡ Smart Ads Engine™</Link>
                            </li>
                        </>
                    )}
                </ul>

                <button onClick={signOut} className="btn btn-secondary" style={{ marginTop: 'auto' }}>
                    Cerrar Sesión
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/coach" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <BusinessCoach />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/copy-builder" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <CopyGenerator />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/analyzer" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <AdAnalyzer />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/budget" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <BudgetCalculator />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/structure" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <CampaignStructure />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/manychat" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <ManyChatBuilder />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/academy" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <Academy />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/metrics" element={
                    <ProtectedRoute allowedRoles={['pro', 'admin', 'client']}>
                        <AppLayout>
                            <MetricsAnalysis />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/system" element={
                    <ProtectedRoute allowedRoles={['workshop', 'pro', 'admin']}>
                        <AppLayout>
                            <SystemHub />
                        </AppLayout>
                    </ProtectedRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
