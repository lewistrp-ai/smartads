import React from 'react';

const SystemHub = () => {
    return (
        <div className="system-hub-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
            <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>🟢</span>
            <h1 style={{ color: 'var(--success)', fontSize: '2.5rem', marginBottom: '1rem' }}>Smart Ads System</h1>
            <p className="subtitle" style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>El cerebro central de automatización, ventas y seguimiento continuo.</p>

            <div className="card glass-panel" style={{ borderTop: '4px solid var(--success)', padding: '3rem 2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Próximamente en tu Ecosistema</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Esta sección se está construyendo para conectar tus campañas ganadoras con herramientas de escalamiento. Dejarás de tener embudos sueltos para construir una máquina predecible.
                </p>

                <div className="grid grid-cols-2 gap-4" style={{ textAlign: 'left' }}>
                    <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span>🤖</span> ManyChat Automations
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Plantillas y flujos probados para cerrar ventas desde los DMs usando los copys del Lab.
                        </p>
                    </div>
                    <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span>🎯</span> CRM / Lead Scoring
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Califica qué leads de Meta Ads están listos para comprar y descarta curiosos.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <button className="btn" style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
                        Notificarme del Lanzamiento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemHub;
