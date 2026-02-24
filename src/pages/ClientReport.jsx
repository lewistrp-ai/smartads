import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ClientReport() {
    const { user } = useAuth();

    const [reportData, setReportData] = useState({
        clientName: '',
        timeframe: 'Semanal',
        objective: 'Ventas/E-commerce'
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/webp') {
                setError('Solo se aceptan imágenes JPG, PNG o WEBP.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen es muy pesada. Máximo 5MB.');
                return;
            }

            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            // Re-use logic by creating a mock event
            handleImageChange({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const generateReport = async (e) => {
        e.preventDefault();

        if (!image) {
            setError('Por favor, sube una captura de pantalla de las métricas primero.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedReport(null);

        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('clientName', reportData.clientName);
            formData.append('timeframe', reportData.timeframe);
            formData.append('objective', reportData.objective);

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/vision/analyze-metrics`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                const parsedReport = response.data.data;
                // Combine the extracted metrics, AI text, and context data
                setGeneratedReport({
                    ...parsedReport.metricsExtracted,
                    ...parsedReport,
                    ...reportData
                });
            } else {
                setError('Hubo un error al generar el reporte.');
            }
        } catch (err) {
            console.error('Error generating AI report:', err);
            setError('Error de conexión al generar el reporte. Verifica tu backend y configuración de API.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const resetAnalysis = () => {
        setImage(null);
        setPreview(null);
        setGeneratedReport(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="client-report-page animate-fade-in">
            <div className="no-print">
                <h1>Reportes para Clientes</h1>
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    Sube una captura de tus métricas (Meta Ads, Google Ads). Nuestra IA <strong>Vision</strong> extraerá los números y redactará un análisis profesional.
                </p>

                <div className="card glass-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                    <form onSubmit={generateReport}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Nombre de la Marca / Cliente</label>
                                <input type="text" className="form-control" name="clientName" value={reportData.clientName} onChange={handleInputChange} placeholder="ej. Clínica Sonrisas" required />
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

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', marginTop: '2rem' }}>Sube el Panel de Métricas</h3>

                        {!preview ? (
                            <div
                                className="upload-dropzone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--primary)',
                                    borderRadius: '1rem',
                                    padding: '3rem 2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '1.5rem'
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/jpeg, image/png, image/webp"
                                    style={{ display: 'none' }}
                                />
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Analizador de Capturas</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                                    Haz clic o arrastra la captura de pantalla (ej. Meta Ads Manager) con las métricas visibles.
                                </p>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '1rem' }}>
                                <img src={preview} alt="Metrics Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain' }} />
                                <div style={{ marginTop: '1rem' }}>
                                    <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>
                                        Cambiar Imagen
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-glow" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }} disabled={isGenerating || !image || generatedReport}>
                                {isGenerating ? <span className="typing-indicator">Analizando métricas con Inteligencia Artificial...</span> : '✨ Generar Reporte desde Imagen'}
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
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>📊 Resumen Ejecutivo (IA)</h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{generatedReport.resumenEjecutivo}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inversión Estimada</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{generatedReport.spend || 'N/A'}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resultados</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--success)' }}>{generatedReport.results || 'N/A'}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>CPA Estimado</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{generatedReport.cpa || 'N/A'}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ROAS / CTR</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{generatedReport.roas !== 'N/A' && generatedReport.roas ? generatedReport.roas : generatedReport.ctr || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                                <h3 style={{ margin: 0, color: 'var(--success)', fontSize: '1.1rem' }}>Lo que funcionó bien</h3>
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
                                <h3 style={{ margin: 0, color: 'var(--warning)', fontSize: '1.1rem' }}>Áreas de Mejora</h3>
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
