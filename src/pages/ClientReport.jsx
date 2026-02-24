import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ClientReport() {
    const { user } = useAuth();

    // Core report configuration
    const [reportData, setReportData] = useState({
        clientName: '',
        timeframe: 'Últimos 30 Días',
        objective: 'Ventas/E-commerce'
    });

    // Meta API States
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);

    // Extracted Metrics States
    const [metrics, setMetrics] = useState(null);
    const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);

    // AI Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    // 1. Fetch campaigns from backend
    const fetchCampaigns = async () => {
        setIsFetchingCampaigns(true);
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meta/campaigns`);
            const data = response.data;
            if (data.success && data.campaigns.length > 0) {
                setCampaigns(data.campaigns);
                setSelectedCampaignId(data.campaigns[0].id);
            } else {
                setError('No se encontraron campañas activas/pausadas en la cuenta configurada.');
            }
        } catch (error) {
            setError('Error conectando con Facebook. Verifica tus API Keys y tu token en el backend.');
            console.error(error);
        } finally {
            setIsFetchingCampaigns(false);
        }
    };

    // 2. Extractor de métricas crudas de campaña específica
    const fetchFromMetaAPI = async () => {
        setIsFetchingMetrics(true);
        setError('');
        setGeneratedReport(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meta/insights`, {
                campaignId: selectedCampaignId || undefined // Cuenta completa si se envía blank
            });
            const data = response.data;

            if (data.success) {
                setMetrics({
                    cpm: data.insights.cpm || '0',
                    ctr: data.insights.ctr || '0',
                    cpc: data.insights.cpc || '0',
                    cpr: data.insights.cpr || '0',
                    results: data.insights.results || '0',
                    spend: data.insights.spend || '0',
                    roas: 'N/A' // Podemos integrarlo luego si recibimos valor de conversión
                });
            } else {
                setError('No se encontraron datos en el periodo.');
            }
        } catch (error) {
            setError('Error al extraer data desde Meta.');
            console.error(error);
        } finally {
            setIsFetchingMetrics(false);
        }
    };

    // 3. Pasar las métricas crudas para Análisis con IA
    const generateReport = async (e) => {
        e.preventDefault();

        if (!metrics) {
            setError('Por favor extrae las métricas de la campaña seleccionada primero.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/generate-report`, {
                clientName: reportData.clientName,
                timeframe: reportData.timeframe,
                objective: reportData.objective,
                metricsExtracted: metrics
            });

            if (response.data.success) {
                const parsedReport = response.data.data;
                setGeneratedReport({
                    ...metrics, // Include the Meta raw metrics
                    ...parsedReport,
                    ...reportData
                });
            } else {
                setError('Hubo un error al la IA interpretar las métricas.');
            }
        } catch (err) {
            console.error('Error generating AI report:', err);
            setError('Error conectando a la API de IA para redacción.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const resetAnalysis = () => {
        setMetrics(null);
        setGeneratedReport(null);
        setError('');
    };

    return (
        <div className="client-report-page animate-fade-in">
            <div className="no-print">
                <h1>Reportes para Clientes</h1>
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    Conecta directamente a <strong>Meta Ads</strong>. Smart Ads descargará los números y redactará tu análisis ejecutivo con Inteligencia Artificial al instante.
                </p>

                <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                    <form onSubmit={generateReport}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Nombre de la Marca / Cliente</label>
                                <input type="text" className="form-control" name="clientName" value={reportData.clientName} onChange={handleInputChange} placeholder="ej. Clínica Sonrisas" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Periodo (En lectura de API)</label>
                                <select className="form-control" name="timeframe" value={reportData.timeframe} onChange={handleInputChange}>
                                    <option value="Últimos 30 Días">Últimos 30 Días (Default Meta)</option>
                                    <option value="Semanal">Semanal (Proximamente API)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Objetivo Principal (Para la IA)</label>
                            <select className="form-control" name="objective" value={reportData.objective} onChange={handleInputChange}>
                                <option value="Ventas/E-commerce">💸 Ventas (E-commerce / Cursos)</option>
                                <option value="Generación de Leads">🧲 Generación de Leads (Formularios / Mensajes)</option>
                                <option value="Tráfico a la Web">🌐 Tráfico al Sitio Web</option>
                                <option value="Reconocimiento de Marca">👁️ Reconocimiento de Marca (Alcance)</option>
                            </select>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', marginTop: '2rem' }}>Fuente de Datos: Meta Ads</h3>

                        <div style={{ background: 'rgba(24, 119, 242, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(24, 119, 242, 0.3)', marginBottom: '1.5rem' }}>
                            {campaigns.length === 0 ? (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={fetchCampaigns}
                                    disabled={isFetchingCampaigns}
                                    style={{ width: '100%', backgroundColor: '#1877F2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    {isFetchingCampaigns ? 'Cargando cuentas y campañas...' : '1. Conectar y Buscar Campañas'}
                                </button>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Selecciona la Campaña:</label>
                                        <select
                                            className="form-control"
                                            value={selectedCampaignId}
                                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                                            style={{ marginTop: '0.5rem' }}
                                        >
                                            <option value="">-- Consolidado de Toda la Cuenta --</option>
                                            {campaigns.map(camp => (
                                                <option key={camp.id} value={camp.id}>
                                                    {camp.status === 'ACTIVE' ? '🟢' : '⚪'} {camp.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={fetchFromMetaAPI}
                                        disabled={isFetchingMetrics}
                                        style={{ borderColor: '#1877F2', color: '#1877F2', fontWeight: 'bold' }}
                                    >
                                        {isFetchingMetrics ? '⬇️ Extrayendo KPIs...' : '2. Extraer KPIs Reales (Últimos 30 días)'}
                                    </button>
                                </div>
                            )}

                            {/* Mostrar confirmación de carga */}
                            {metrics && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--success)' }}>✅ KPIs Extraídos Exitosamente (${metrics.spend} Gastados)</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Listo para AI Report</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-glow" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }} disabled={isGenerating || !metrics || generatedReport}>
                                {isGenerating ? <span className="typing-indicator">Escaneando números y redactando...</span> : '✨ Generar Reporte con IA'}
                            </button>
                            {generatedReport && (
                                <button type="button" onClick={resetAnalysis} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                                    ↺ Hacer Otro
                                </button>
                            )}
                        </div>
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
                    margin: '0 auto',
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
                            <p style={{ margin: '0 0 0 0', fontSize: '0.75rem', color: '#1877F2' }}>
                                Fuente API: Meta Ads
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>📊 Resumen Ejecutivo Inteligente</h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{generatedReport.resumenEjecutivo}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inversión (Spend)</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${generatedReport.spend}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resultados Top</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--success)' }}>{generatedReport.results}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Costo x Acción (CPA)</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${generatedReport.cpr}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CTR | CPC</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{generatedReport.ctr}% | ${generatedReport.cpc}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                                <h3 style={{ margin: 0, color: 'var(--success)', fontSize: '1.1rem' }}>Desempeño a Favor</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                {generatedReport.puntosPositivos && generatedReport.puntosPositivos.map((punto, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{punto}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🟡</span>
                                <h3 style={{ margin: 0, color: 'var(--warning)', fontSize: '1.1rem' }}>Acciones Correctivas y Mejora</h3>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                {generatedReport.oportunidadesMejora && generatedReport.oportunidadesMejora.map((punto, idx) => (
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
