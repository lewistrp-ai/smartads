import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_LEVELS, getUnlockedLevels, getOffer, openCheckout, formatCOP, NEXT_STEP_OFFER_IDS } from '../config/ladder';
import Glosario from '../components/academy/Glosario';
import Quizzes from '../components/academy/Quizzes';
import CampaignStructureDiagram from '../components/academy/CampaignStructureDiagram';
import CampaignStages from '../components/academy/CampaignStages';
import SimpleMetrics from '../components/academy/SimpleMetrics';
import VideoLibrary from '../components/academy/VideoLibrary';
import Certificate from '../components/academy/Certificate';

const Academy = () => {
    const { user, role, plan } = useAuth();
    const navigate = useNavigate();
    const unlockedLevels = getUnlockedLevels(role, plan);
    const [activeTab, setActiveTab] = useState('ruta'); // 'ruta' | 'videos'
    const [activeModule, setActiveModule] = useState(null);
    const [completedModules, setCompletedModules] = useState([]);
    const [showCertificate, setShowCertificate] = useState(false);

    // Load progress from local storage
    useEffect(() => {
        const savedProgress = localStorage.getItem('smartAdsAcademyProgress');
        if (savedProgress) {
            setCompletedModules(JSON.parse(savedProgress));
        }
    }, []);

    const markAsCompleted = (moduleId) => {
        if (!completedModules.includes(moduleId)) {
            const newProgress = [...completedModules, moduleId];
            setCompletedModules(newProgress);
            localStorage.setItem('smartAdsAcademyProgress', JSON.stringify(newProgress));
        }
        setActiveModule(null); // Return to list
    };

    // Al pulsar "Desbloquear nivel": abre el checkout de Hotmart de ese nivel.
    // Si el link aún no está configurado, lleva a la página de ofertas.
    const unlockLevel = (level) => {
        const offer = getOffer(level.offerId);
        if (!openCheckout(offer)) {
            navigate('/crecimiento');
        }
    };

    // Checkout de una oferta cualquiera (con respaldo a la página de ofertas).
    const goToOffer = (offer) => {
        if (!openCheckout(offer)) {
            navigate('/crecimiento');
        }
    };

    // Ofertas del "momento de oro" que se muestran al completar el Nivel 1.
    const nextStepOffers = NEXT_STEP_OFFER_IDS.map(getOffer).filter(Boolean);

    // The Official Smart Ads Learning Track
    const curriculum = [
        {
            phase: 1,
            title: "Fundamentos (Setup & Bases)",
            description: "Las reglas del juego antes de lanzar tu primer anuncio.",
            color: "var(--primary)",
            modules: [
                { id: 1, component: <Glosario />, title: "Glosario Inteligente & KPIs", description: "Aprende el idioma de Meta: CPM, CTR, CPA y ROAS." },
                { id: 2, component: <Quizzes />, title: "Test de Nivel", description: "Valida tus conocimientos fundamentales." }
            ]
        },
        {
            phase: 2,
            title: "Creación Estratégica",
            description: "De la teoría a la práctica: Cómo construir máquinas de ventas.",
            color: "var(--warning)",
            modules: [
                { id: 3, component: <CampaignStructureDiagram />, title: "Arquitectura de Campañas", description: "Distribución de presupuestos y CBO vs ABO." }
            ]
        },
        {
            phase: 3,
            title: "Optimización y Escalabilidad",
            description: "Qué hacer cuando hay ventas (escalar) y qué hacer cuando no las hay (apagar).",
            color: "var(--success)",
            modules: [
                { id: 4, component: <CampaignStages />, title: "Etapas del Ecosistema", description: "Testeo, Optimización y Mantenimiento." },
                { id: 5, component: <SimpleMetrics />, title: "Lectura y Diagnóstico", description: "Árbol de decisiones basado en métricas reales." }
            ]
        }
    ];

    const totalModules = curriculum.reduce((acc, phase) => acc + phase.modules.length, 0);
    const progressPercentage = Math.round((completedModules.length / totalModules) * 100);

    const renderRuta = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '2rem', paddingBottom: '3rem' }}>

            {/* Gamified Progress Bar */}
            <div className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tu Progreso de Dominio</h3>
                    <span style={{ fontWeight: 'bold', color: progressPercentage === 100 ? 'var(--success)' : 'var(--accent-color)', fontSize: '1.2rem' }}>
                        {progressPercentage}%
                    </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progressPercentage}%`,
                        height: '100%',
                        background: progressPercentage === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), var(--accent-color))',
                        transition: 'width 0.5s ease-out'
                    }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Has completado {completedModules.length} de {totalModules} lecciones.
                    {progressPercentage === 100 ? ' ¡Felicidades, completaste el Nivel 1! 🏆' : ' Sigue así.'}
                </p>
                {progressPercentage === 100 && (
                    <button
                        className="btn"
                        onClick={() => setShowCertificate(true)}
                        style={{ alignSelf: 'flex-start', background: 'var(--success)', color: 'black', fontWeight: 'bold' }}
                    >
                        🏆 Ver mi certificado
                    </button>
                )}
            </div>

            {/* Momento de oro: oferta del siguiente peldaño al completar el Nivel 1 */}
            {progressPercentage === 100 && nextStepOffers.length > 0 && (
                <div className="card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--accent-color)', background: 'linear-gradient(180deg, rgba(59,130,246,0.08), transparent 70%)' }}>
                    <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem' }}>🎉 Terminaste el Nivel 1. ¿Sigues subiendo?</h3>
                    <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Oferta especial para quienes ya dominan los fundamentos. Este es tu siguiente paso:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        {nextStepOffers.map((offer) => (
                            <div
                                key={offer.id}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.1rem',
                                    borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${offer.highlight ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{offer.icon}</span>
                                    {offer.recurring && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Recurrente</span>}
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>{offer.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{offer.subtitle}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {formatCOP(offer.priceCOP)}{offer.recurring && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mes</span>}
                                    </span>
                                    <button
                                        className="btn"
                                        onClick={() => goToOffer(offer)}
                                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', background: 'var(--accent-color)', color: 'black', fontWeight: 'bold' }}
                                    >
                                        {offer.cta}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate('/crecimiento')}
                        style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline', padding: 0 }}
                    >
                        Ver toda la escalera de crecimiento →
                    </button>
                </div>
            )}

            {/* Escalera de Niveles (formación por niveles con bloqueo) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ruta de Niveles</h3>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {ACADEMY_LEVELS.map((level) => {
                        const isUnlocked = unlockedLevels.includes(level.id);
                        return (
                            <div
                                key={level.id}
                                className="card"
                                style={{
                                    margin: 0, padding: '1.25rem', position: 'relative',
                                    border: `1px solid ${isUnlocked ? level.color : 'var(--border-color)'}`,
                                    background: isUnlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                    opacity: isUnlocked ? 1 : 0.85,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: level.color, fontWeight: 'bold' }}>
                                        Nivel {level.id}
                                    </span>
                                    <span>{isUnlocked ? '✅' : '🔒'}</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem' }}>{level.name.split('·')[1]?.trim() || level.name}</h4>
                                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{level.tagline}</p>
                                {isUnlocked ? (
                                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Acceso activo</span>
                                ) : (
                                    <button
                                        className="btn"
                                        onClick={() => unlockLevel(level)}
                                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', background: 'transparent', color: level.color, border: `1px solid ${level.color}`, fontWeight: 'bold' }}
                                    >
                                        Desbloquear · {formatCOP(level.priceCOP)} →
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Vertical Progressive Track */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {curriculum.map((phase, idx) => (
                    <div key={phase.phase} style={{ position: 'relative' }}>
                        {/* Phase Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: phase.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'black', zIndex: 2
                            }}>
                                {phase.phase}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.3rem', color: phase.color }}>Fase {phase.phase}: {phase.title}</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{phase.description}</p>
                            </div>
                        </div>

                        {/* Modules in Phase */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '20px', marginLeft: '20px', borderLeft: `2px dashed ${phase.color}40` }}>
                            {phase.modules.map((mod) => {
                                const isCompleted = completedModules.includes(mod.id);
                                return (
                                    <div
                                        key={mod.id}
                                        className="card hover-scale"
                                        style={{
                                            margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem',
                                            border: isCompleted ? '1px solid var(--success)' : '1px solid var(--border-color)',
                                            background: isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)'
                                        }}
                                        onClick={() => setActiveModule(mod)}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                {isCompleted && <span style={{ color: 'var(--success)' }}>✅</span>}
                                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: isCompleted ? 'white' : 'var(--accent-color)' }}>{mod.title}</h4>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{mod.description}</p>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)' }}>&rarr;</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActiveModule = () => {
        if (!activeModule) return null;

        const isCompleted = completedModules.includes(activeModule.id);

        return (
            <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '1px', fontWeight: 'bold' }}>Lección Activa</span>
                        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{activeModule.title}</h2>
                    </div>
                    {isCompleted && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                            ✅ Lección Completada
                        </div>
                    )}
                </div>

                {/* Module Content */}
                <div style={{ marginBottom: '3rem' }}>
                    {activeModule.component}
                </div>

                {/* Unified Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <button className="btn-secondary" onClick={() => setActiveModule(null)}>
                        &larr; Volver a la Ruta
                    </button>
                    {!isCompleted ? (
                        <button className="btn btn-glow" onClick={() => markAsCompleted(activeModule.id)} style={{ background: 'var(--success)', color: 'black', fontWeight: 'bold' }}>
                            Marcar como Completado ✅
                        </button>
                    ) : (
                        <button className="btn-secondary" onClick={() => setActiveModule(null)}>
                            Continuar &rarr;
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="academy-container animate-fade-in" style={{ padding: '0', maxWidth: activeModule ? '1200px' : '900px', margin: '0 auto', transition: 'max-width 0.3s' }}>

            {showCertificate && (
                <Certificate
                    studentName={user?.email?.split('@')[0] || 'Alumno Smart Ads'}
                    levelName={ACADEMY_LEVELS[0].name}
                    onClose={() => setShowCertificate(false)}
                />
            )}

            {/* Main Header / Navigation */}
            {!activeModule && (
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>Centro de Formación Oficial</h1>
                    <p className="subtitle" style={{ margin: '0.5rem 0 1.5rem 0', fontSize: '1.1rem' }}>Domina el ecosistema publicitario con nuestra ruta probada o explora recursos en video.</p>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <button
                            className="btn"
                            onClick={() => setActiveTab('ruta')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'ruta' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                fontWeight: activeTab === 'ruta' ? 'bold' : 'normal',
                                borderBottom: activeTab === 'ruta' ? '2px solid var(--accent-color)' : '2px solid transparent',
                                borderRadius: 0,
                                padding: '0.5rem 1rem'
                            }}
                        >
                            📍 Ruta de Dominio
                        </button>
                        <button
                            className="btn"
                            onClick={() => setActiveTab('videos')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'videos' ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeTab === 'videos' ? 'bold' : 'normal',
                                borderBottom: activeTab === 'videos' ? '2px solid white' : '2px solid transparent',
                                borderRadius: 0,
                                padding: '0.5rem 1rem'
                            }}
                        >
                            📺 Biblioteca de Videos
                        </button>
                    </div>
                </div>
            )}

            {/* View Routing */}
            {activeModule
                ? renderActiveModule()
                : activeTab === 'ruta'
                    ? renderRuta()
                    : <VideoLibrary />
            }
        </div>
    );
};

export default Academy;
