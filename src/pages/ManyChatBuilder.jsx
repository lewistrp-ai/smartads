import React, { useState } from 'react';
import axios from 'axios';

function ManyChatBuilder() {
    const [formData, setFormData] = useState({
        objective: 'leads', // leads, sales, webinar, rsvp, support
        niche: '',
        product: '',
        tone: 'amigable' // amigable, formal, agresivo
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateFlow = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setResults(null);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/generate-manychat-flow`, formData);
            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (error) {
            console.error('Failed to generate ManyChat flow:', error);
            alert('Error al generar el flujo. Asegúrate de que el servidor esté activo.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper to render the recursive tree recursively
    const renderNodeMap = (nodeId, allNodes, depth = 0) => {
        const node = allNodes.find(n => n.id === nodeId);
        if (!node) return null;

        let icon = '💬';
        let bgStyle = 'var(--bg-primary)';
        let borderColor = 'var(--border-color)';

        if (node.type === 'collect_data') {
            icon = '📇';
            borderColor = 'var(--primary)';
        } else if (node.type === 'action') {
            icon = '⚡';
            borderColor = 'var(--success)';
            bgStyle = 'rgba(34, 197, 94, 0.1)';
        }

        return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 1rem' }}>
                <div style={{
                    background: bgStyle,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '0.8rem',
                    padding: '1.2rem',
                    width: '320px',
                    position: 'relative',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>{icon}</span>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {node.text}
                    </p>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {node.id.replace('node-', '')}
                    </div>
                </div>

                {
                    node.options && node.options.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <div style={{ width: '2px', height: '2rem', background: 'var(--border-color)' }}></div>
                            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', position: 'relative' }}>
                                {node.options.length > 1 && (
                                    <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', background: 'var(--border-color)' }}></div>
                                )}
                                {node.options.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                        {node.options.length > 1 && (
                                            <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '1rem', background: 'var(--border-color)', transform: 'translateX(-50%)' }}></div>
                                        )}
                                        <div style={{ background: 'var(--accent-color)', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 2, marginTop: node.options.length > 1 ? '1rem' : '0' }}>
                                            {opt.text}
                                        </div>
                                        <div style={{ width: '2px', height: '1.5rem', background: 'var(--border-color)' }}></div>
                                        {renderNodeMap(opt.nextId, allNodes, depth + 1)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >
        );
    };

    return (
        <div className="manychat-builder animate-fade-in">
            <h1 style={{ textAlign: results ? 'left' : 'center' }}>Automations Builder 🤖</h1>
            {!results && (
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    Genera el mapa visual exacto para configurar tu bot de ManyChat. Diseñado para alta conversión.
                </p>
            )}

            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: results ? 'minmax(300px, 350px) 1fr' : '1fr', maxWidth: results ? '100%' : '600px', margin: '0 auto' }}>

                {/* Configuration Panel */}
                <div className="card glass-panel" style={{ position: results ? 'sticky' : 'static', top: '2rem', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Configuración del Embudo</h2>

                    <form onSubmit={generateFlow}>
                        <div className="form-group mb-4">
                            <label>Objetivo de la Automatización</label>
                            <select className="form-control" name="objective" value={formData.objective} onChange={handleInputChange}>
                                <option value="leads">📇 Captación de Leads (Emails / Teléfono)</option>
                                <option value="sales">🛒 Ventas / Catálogo E-commerce</option>
                                <option value="webinar">🎓 Registro a Webinar / Masterclass</option>
                                <option value="support">💬 Soporte, FAQ y Calificación</option>
                            </select>
                        </div>

                        <div className="form-group mb-4">
                            <label>Tono de Comunicación</label>
                            <select className="form-control" name="tone" value={formData.tone} onChange={handleInputChange}>
                                <option value="amigable">Amigable, Casual y Empático (Muchos Emojis)</option>
                                <option value="formal">Profesional, B2B, Directo</option>
                                <option value="agresivo">Venta dura, Urgencia, FOMO</option>
                            </select>
                        </div>

                        <div className="form-group mb-4">
                            <label>Nicho de Mercado</label>
                            <input type="text" className="form-control" name="niche" value={formData.niche} onChange={handleInputChange} placeholder="ej. Bienes Raíces, Odontología, Moda..." required />
                        </div>

                        <div className="form-group mb-4">
                            <label>Producto o Servicio Principal</label>
                            <input type="text" className="form-control" name="product" value={formData.product} onChange={handleInputChange} placeholder="ej. Departamentos en Pre-Venta, Limpieza Dental..." required />
                        </div>

                        <button type="submit" className="btn btn-glow" disabled={isGenerating} style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}>
                            {isGenerating ? 'Mapeando Flujo...' : '⚡ Generar Mapa del Bot'}
                        </button>
                    </form>
                </div>

                {/* Automation Flow Result */}
                {results && (
                    <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.5rem' }}>{results.title}</h2>
                                    <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        🎯 Disparador: {results.trigger}
                                    </div>
                                </div>
                                <button className="btn" onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    🖨️ Exportar PDF
                                </button>
                            </div>

                            <p style={{ margin: '1rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                <strong>Racional Estratégico:</strong> {results.strategyRationale}
                            </p>
                        </div>

                        {/* Visual Flow Map */}
                        <div className="card map-container" style={{ overflowX: 'auto', background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))', minHeight: '500px', display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
                            <div style={{ minWidth: 'fit-content' }}>
                                {renderNodeMap('node-1', results.nodes)}
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--border-color)' }}></span> Mensaje Simple</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></span> Recolección de Datos</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></span> Acción Interna (Etiquetas)</span>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default ManyChatBuilder;
