import React, { useState } from 'react';

const SimpleMetrics = () => {
    const [metrics, setMetrics] = useState({
        ctr: 1.5,
        cpm: 5.0,
        cpc: 0.3,
        cpa: 15.0,
        margen: 20.0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMetrics(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const getDiagnosis = () => {
        let issues = [];
        let positives = [];

        // CTR Analysis
        if (metrics.ctr < 1.0) {
            issues.push({
                metric: 'CTR Bajo',
                icon: '👀',
                diagnosis: 'Tus anuncios son aburridos o no llaman la atención.',
                solution: 'Cambia la imagen/video o mejora los primeros 3 segundos del gancho. Promete un beneficio más grande.'
            });
        } else {
            positives.push({ metric: 'CTR Saludable', text: 'La gente sí se detiene a ver tu anuncio.' });
        }

        // CPM Analysis
        if (metrics.cpm > 10.0 && metrics.ctr < 2.0) {
            issues.push({
                metric: 'CPM Alto',
                icon: '💸',
                diagnosis: 'Meta Ads te está cobrando muy caro por mostrarte.',
                solution: 'Tu público puede ser demasiado pequeño, o tu anuncio tiene un "Quality Score" bajo porque a la gente no le gusta.'
            });
        }

        // CPC Analysis
        if (metrics.cpc > 0.8 && metrics.ctr < 1.0) {
            // Usually linked to low CTR
        } else if (metrics.cpc > 0.8) {
            issues.push({
                metric: 'CPC Alto',
                icon: '🖱️',
                diagnosis: 'Generar clics te sale muy caro.',
                solution: 'Si el CTR es bueno pero el clics es caro, intenta probar otro segmento de público, la competencia donde estás pujando está fiera.'
            });
        }

        // CPA Analysis
        if (metrics.cpa > metrics.margen) {
            issues.push({
                metric: 'CPA / Costo por Compra Roto',
                icon: '🔥',
                diagnosis: 'Estás perdiendo dinero literal. Cuesta más adquirir al cliente que lo que te paga.',
                solution: 'Si el CTR y CPC son buenos, la culpa la tiene tu PÁGINA WEB o el PRECIO del producto. Mejora tu oferta.'
            });
        } else if (metrics.cpa > 0 && metrics.cpa <= metrics.margen / 2) {
            positives.push({ metric: 'CPA Excelente', text: 'Estás muy rentable. ¡Es hora de escalar presupuesto!' });
        }

        return { issues, positives };
    };

    const diagnosis = getDiagnosis();

    return (
        <div className="simple-metrics-container animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Métricas Explicadas Fácil</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Introduce los números de tu campaña actual (o juega con los deslizadores) y descubre qué significa tu resultado en idioma humano.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'flex-start' }}>
                {/* Inputs Section */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Tus Números</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>CTR (%)</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{metrics.ctr}%</span>
                            </label>
                            <input type="range" name="ctr" min="0" max="5" step="0.1" value={metrics.ctr} onChange={handleChange} style={{ width: '100%' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Porcentaje de personas que hacen clic al ver tu anuncio.</p>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>CPM ($ USD)</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${metrics.cpm}</span>
                            </label>
                            <input type="range" name="cpm" min="1" max="25" step="0.5" value={metrics.cpm} onChange={handleChange} style={{ width: '100%' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Costo por cada 1,000 impresiones.</p>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>CPC ($ USD)</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${metrics.cpc}</span>
                            </label>
                            <input type="range" name="cpc" min="0" max="3" step="0.05" value={metrics.cpc} onChange={handleChange} style={{ width: '100%' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Costo por Clic Promedio.</p>
                        </div>

                        <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>CPA / Costo por Compra ($ USD)</span>
                                <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>${metrics.cpa}</span>
                            </label>
                            <input type="number" name="cpa" className="form-control" value={metrics.cpa} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Margen de Ganancia del Producto ($)</span>
                                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>${metrics.margen}</span>
                            </label>
                            <input type="number" name="margen" className="form-control" value={metrics.margen} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Output / Diagnosis Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.8))', borderColor: 'var(--primary)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <span>👨‍⚕️</span> Diagnóstico del Doctor
                        </h3>

                        {diagnosis.issues.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid var(--success)' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚀</span>
                                <h4 style={{ color: 'var(--success)', margin: '0 0 0.5rem 0' }}>¡Tus métricas están perfectas!</h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No toques nada, estás ganando dinero. Disfruta de la rentabilidad o empieza a escalar invirtiendo más presupuesto.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {diagnosis.issues.map((issue, idx) => (
                                    <div key={idx} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem', borderLeft: `4px solid ${issue.metric.includes('CPA') ? 'var(--warning)' : '#ef4444'}` }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: issue.metric.includes('CPA') ? 'var(--warning)' : '#ef4444' }}>
                                            <span>{issue.icon}</span> Problema: {issue.metric}
                                        </h4>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
                                            <strong>En español:</strong> {issue.diagnosis}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <strong>Solución:</strong> {issue.solution}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {diagnosis.positives.length > 0 && diagnosis.issues.length > 0 && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Lo que sí estás haciendo bien:</h4>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {diagnosis.positives.map((pos, idx) => (
                                        <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--success)' }}>✔</span>
                                            <span><strong>{pos.metric}:</strong> {pos.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleMetrics;
