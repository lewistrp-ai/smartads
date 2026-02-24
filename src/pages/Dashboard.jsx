import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { role, user } = useAuth(); // role can be 'workshop', 'pro', 'client', 'admin'

    const renderProView = () => (
        <>
            <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(145deg, #1E3A8A, var(--bg-secondary))', borderColor: '#3B82F6', textAlign: 'center', padding: '3rem 2rem' }}>
                <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                    <span style={{ color: 'var(--accent-color)' }}>Smart Ads</span> no es un curso.<br />
                    Es el sistema operativo de tu marketing.
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
                    Un ecosistema inteligente que combina estrategia, simulación matemática, arquitectura de campañas y generación de activos publicitarios bajo una misma metodología propietaria.
                </p>
                <div style={{ marginBottom: '2rem' }}>
                    <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-color)', fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid var(--accent-color)' }}>
                        🧠 Basado en el Método Smart Funnel™
                    </span>
                </div>
                {role === 'pro' && (
                    <span className="badge" style={{ background: 'white', color: '#1E3A8A', fontSize: '0.875rem' }}>🔥 Ecosistema PRO Activado</span>
                )}
            </div>

            <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🔵</span> Smart Ads Lab
            </h2>
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="card hover-scale" style={{ borderTop: '3px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>✍️ Generador de Activos</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Estrategia y copywriting adaptado a temperatura de tráfico.</p>
                    <Link to="/copy-builder" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>Ejecutar</Link>
                </div>
                <div className="card hover-scale" style={{ borderTop: '3px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>👩‍⚕️ Diagnóstico Estratégico</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Conecta Meta Ads y descubre dónde falla tu embudo.</p>
                    <Link to="/metrics" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>Analizar</Link>
                </div>
                <div className="card hover-scale" style={{ borderTop: '3px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>💰 Simulador de Negocios</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Ingeniería inversa matemática para proyectar tu ROI.</p>
                    <Link to="/budget" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>Simular</Link>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.8rem' }}>🟣</span> Smart Ads Academy
                    </h2>
                    <div className="card hover-scale" style={{ borderTop: '3px solid #a855f7', height: 'calc(100% - 4.5rem)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Ruta Oficial Smart Ads™</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Domina el ecosistema pasando de nivel básico a experto: Glosario, Estructuras, Etapas y Evaluadores.
                        </p>
                        <Link to="/academy" className="btn" style={{ background: '#a855f7', borderColor: '#a855f7', width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                            Entrar a la Academia
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.8rem' }}>🟢</span> Smart Ads System
                    </h2>
                    <div className="card hover-scale" style={{ borderTop: '3px solid var(--success)', height: 'calc(100% - 4.5rem)', background: 'rgba(16, 185, 129, 0.03)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Smart Ads Engine™</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            El motor de automatización y conversión inteligente que conecta tráfico, CRM y cierres en un solo flujo estratégico.
                        </p>
                        <Link to="/system" className="btn btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)', width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                            Descubrir el Sistema
                        </Link>
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Smart Ads Insights (Análisis Global)</h2>
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontWeight: 'normal', margin: 0 }}>Copys Generados</h4>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>0</span>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontWeight: 'normal', margin: 0 }}>Auditorías Realizadas</h4>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--warning)' }}>0</span>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontWeight: 'normal', margin: 0 }}>Gasto Analizado</h4>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>$0.00</span>
                </div>
            </div>

            <div className="card" style={{ borderColor: 'var(--border-color)', opacity: 0.7 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span>🗂️</span> Historial Reciente
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                    Aún no hay actividad guardada. Genera tu primer copy o audita tu primera campaña para ver el historial aquí.
                </p>
                <Link to="/metrics" className="btn" style={{ display: 'block', margin: '0 auto', maxWidth: '300px' }}>Iniciar mi primera Auditoría</Link>
            </div>
        </>
    );

    const renderClientView = () => (
        <>
            <div className="card" style={{ marginTop: '2rem', background: 'var(--bg-secondary)', borderColor: 'var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ color: 'white' }}>Panel Estratégico de Cliente 📊</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            Bienvenido a tu hub de reportes automáticos. Aquí verás cómo el equipo escala tus campañas.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card glass-panel" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🚧</span>
                <h3 style={{ marginBottom: '1rem' }}>No hay reportes activos</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    La Agencia aún no ha compartido el diagnóstico de este mes para tu cuenta de Meta Ads. Los reportes y recomendaciones estratégicas aparecerán en esta vista una vez que se envíen.
                </p>
            </div>
        </>
    );

    return (
        <div className="dashboard animate-fade-in">
            <h1>Hola, {user?.email?.split('@')[0] || 'Estratega'} 👋</h1>
            <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>Bienvenido a tu infraestructura de marketing inteligente.</p>

            {role === 'client' ? renderClientView() : renderProView()}

        </div>
    );
}

export default Dashboard;
