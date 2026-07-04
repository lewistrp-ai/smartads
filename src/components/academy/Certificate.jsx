import React from 'react';

// Certificado que se emite cuando el alumno completa un nivel de la Academy.
// Es la "Certificación Lewis Pineda" de la estrategia: refuerza la marca y
// da un motivo para avanzar al siguiente nivel de la escalera.
const Certificate = ({ studentName, levelName, onClose }) => {
    const dateStr = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-in"
                style={{
                    maxWidth: '640px', width: '100%', background: 'var(--bg-secondary)',
                    border: '2px solid var(--accent-color)', borderRadius: '1rem', overflow: 'hidden',
                }}
            >
                {/* Marco del certificado */}
                <div style={{ padding: '3rem 2.5rem', textAlign: 'center', background: 'linear-gradient(160deg, rgba(255,255,255,0.04), transparent)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                    <p style={{ margin: 0, letterSpacing: '3px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Certificado de finalización
                    </p>
                    <h2 style={{ margin: '0.75rem 0 1.5rem 0', fontSize: '1.4rem', color: 'var(--accent-color)' }}>
                        Smart Ads Academy
                    </h2>

                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Se otorga a</p>
                    <p style={{ margin: '0.25rem 0 1.25rem 0', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {studentName}
                    </p>

                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>por completar con éxito</p>
                    <p style={{ margin: '0.25rem 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {levelName}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fecha</p>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{dateStr}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', fontFamily: 'cursive' }}>Lewis Pineda</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.25rem' }}>
                                Fundador · Smart Ads
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', borderTop: '1px solid var(--border-color)' }}>
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn" onClick={() => window.print()} style={{ background: 'var(--accent-color)', color: 'black', fontWeight: 'bold' }}>
                        Descargar / Imprimir 🖨️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
