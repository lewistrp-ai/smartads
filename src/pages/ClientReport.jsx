import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ClientReport() {
    const { user } = useAuth();

    const [reportData, setReportData] = useState({
        clientName: '',
        timeframe: 'Semanal',
        objective: 'Ventas/E-commerce',
        spend: '',
        results: '',
        cpa: '',
        roas: '',
        ctr: '',
        cpm: '',
        cpc: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    const generateReport = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setError('');
        setGeneratedReport(null);

        try {
            // Reusing the chat completion endpoint but giving it a specific system prompt context
            const promptContext = `
Eres un analista de marketing senior. El usuario necesita un reporte profesional para entregarle a su cliente.
Nombre del cliente: ${reportData.clientName}
Rango de tiempo: ${reportData.timeframe}
Objetivo de la campaña: ${reportData.objective}
Métricas: 
- Inversión: $${reportData.spend}
- Resultados (Ventas/Leads): ${reportData.results}
- CPA (Costo por Adquisición): $${reportData.cpa}
- ROAS: ${reportData.roas || 'N/A'}
- CTR: ${reportData.ctr}%
- CPM: $${reportData.cpm}
- CPC: $${reportData.cpc}

Tu tarea es devolver un reporte estructurado EXACTAMENTE en este formato JSON:
{
  "resumenEjecutivo": "Un párrafo empático y directo resumiendo el desempeño general hacia el objetivo.",
  "puntosPositivos": ["Punto 1", "Punto 2", "Punto 3"],
  "oportunidadesMejora": ["Oportunidad 1", "Oportunidad 2"]
}

No agregues markdown markdown block de código, SOLO devuelve el JSON válido.
`;

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/analyze`, {
                message: "Genera el reporte en JSON",
                metricsContext: { context: promptContext }, // We hack the context into the existing endpoint structure
                history: []
            });

            if (response.data.success) {
                try {
                    // Extract JSON from response (in case AI wraps it in markdown)
                    let reply = response.data.reply;
                    reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedReport = JSON.parse(reply);
                    setGeneratedReport({ ...parsedReport, ...reportData });
                } catch (parseError) {
                    // Fallback if AI didn't return perfect JSON
                    console.error('Failed to parse AI JSON', parseError, response.data.reply);
                    setError('La Inteligencia Artificial no devolvió el formato esperado. Intenta de nuevo.');
                }
            } else {
                setError('Hubo un error al generar el reporte.');
            }
        } catch (err) {
            console.error('Error generating report:', err);
            setError('Error de conexión al generar el reporte.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="client-report-page">
            <div className="no-print">
                <h1>Reportes para Clientes</h1>
                <p className="subtitle">Genera reportes de desempeño hiper-profesionales con Inteligencia Artificial.</p>

                <div className="card" style={{ maxWidth: '800px', margin: '0 0 2rem 0' }}>
                    <form onSubmit={generateReport}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Nombre de la Marca / Cliente</label>
                                <input type="text" className="form-control" name="clientName" value={reportData.clientName} onChange={handleInputChange} placeholder="ej. Clínica Dental Sonrisas" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Periodo del Reporte</label>
                                <select className="form-control" name="timeframe" value={reportData.timeframe} onChange={handleInputChange}>
                                    <option value="Diario">Diario</option>
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensual">Mensual</option>
                                    <option value="Trimestral">Trimestral</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Objetivo Principal</label>
                            <select className="form-control" name="objective" value={reportData.objective} onChange={handleInputChange}>
                                <option value="Ventas/E-commerce">💸 Ventas (E-commerce / Cursos)</option>
                                <option value="Generación de Leads">🧲 Generación de Leads (Formularios / Mensajes)</option>
                                <option value="Tráfico a la Web">🌐 Tráfico al Sitio Web</option>
                                <option value="Reconocimiento de Marca">👁️ Reconocimiento de Marca (Alcance)</option>
                            </select>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Métricas del Periodo</h3>
                        <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label>Inversión ($)</label>
                                <input type="number" step="0.01" className="form-control" name="spend" value={reportData.spend} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Resultados (Leads/Ventas)</label>
                                <input type="number" step="0.01" className="form-control" name="results" value={reportData.results} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Costo x Resultado ($ CPA)</label>
                                <input type="number" step="0.01" className="form-control" name="cpa" value={reportData.cpa} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>ROAS</label>
                                <input type="number" step="0.01" className="form-control" name="roas" value={reportData.roas} onChange={handleInputChange} placeholder="Opcional" />
                            </div>
                            <div className="form-group">
                                <label>CTR (%)</label>
                                <input type="number" step="0.01" className="form-control" name="ctr" value={reportData.ctr} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>CPM ($)</label>
                                <input type="number" step="0.01" className="form-control" name="cpm" value={reportData.cpm} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>CPC ($)</label>
                                <input type="number" step="0.01" className="form-control" name="cpc" value={reportData.cpc} onChange={handleInputChange} required />
                            </div>
                        </div>

                        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

                        <button type="submit" className="btn" style={{ width: '100%' }} disabled={isGenerating}>
                            {isGenerating ? <span className="typing-indicator">Analizando métricas y redactando...</span> : '✨ Generar Reporte con IA'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Printable Report Area */}
            {generatedReport && (
                <div className="report-print-container" style={{
                    backgroundColor: 'var(--bg-primary)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)',
                    maxWidth: '800px',
                    color: 'var(--text-primary)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '2px solid var(--accent-color)', paddingBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Reporte de Desempeño</h2>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Cliente: <strong style={{ color: 'var(--text-primary)' }}>{generatedReport.clientName}</strong></p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Periodo: {generatedReport.timeframe} | Objetivo: {generatedReport.objective}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                                <span style={{ color: 'var(--text-primary)' }}>Smart Ads OS</span>
                            </div>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Generado el {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>📊 Resumen Ejecutivo</h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{generatedReport.resumenEjecutivo}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inversión</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${generatedReport.spend}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resultados</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{generatedReport.results}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CPA</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${generatedReport.cpa}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{generatedReport.roas ? 'ROAS' : 'CTR'}</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{generatedReport.roas ? `${generatedReport.roas}x` : `${generatedReport.ctr}%`}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                                <h3 style={{ margin: 0, color: 'var(--success)', fontSize: '1.1rem' }}>Puntos Positivos</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                {generatedReport.puntosPositivos.map((punto, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{punto}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🟡</span>
                                <h3 style={{ margin: 0, color: 'var(--warning)', fontSize: '1.1rem' }}>Oportunidades de Mejora</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                {generatedReport.oportunidadesMejora.map((punto, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{punto}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="no-print" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                        <button onClick={handlePrint} className="btn" style={{ backgroundColor: 'var(--success)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Imprimir / Guardar PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientReport;
