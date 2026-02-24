import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdAnalyzer() {
    const { user, isPro } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [productContext, setProductContext] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/webp') {
                setError('Solo se aceptan imágenes JPG, PNG o WEBP.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('La imagen es muy pesada. Máximo 5MB.');
                return;
            }

            setImage(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
            setResults(null);
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

    const analyzeAd = async () => {
        if (!image) {
            setError('Por favor sube una imagen del anuncio primero.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', image);
        if (productContext) {
            formData.append('productContext', productContext);
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/vision/analyze-ad`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (err) {
            console.error('Vision API Error:', err);
            setError('Hubo un error analizando la imagen. Asegúrate de que el backend y tu Gemini API Key estén configurados correctamente.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setImage(null);
        setPreview(null);
        setResults(null);
        setProductContext('');
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="ad-analyzer animate-fade-in">
            <h1 style={{ textAlign: results ? 'left' : 'center' }}>Visual Ad Analyzer 👁️</h1>
            {!results && (
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    Sube una captura de pantalla del anuncio ganador de tu competencia. Nuestra IA extraerá su <strong>fórmula psicológica</strong> y te dará un manual para replicarlo en tu negocio.
                </p>
            )}

            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: results ? 'minmax(300px, 400px) 1fr' : '1fr', maxWidth: results ? '100%' : '600px', margin: '0 auto' }}>

                {/* Upload & Context Control Panel */}
                <div className="card glass-panel" style={{ position: results ? 'sticky' : 'static', top: '2rem', height: 'fit-content' }}>
                    {!results ? (
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Carga de Creativo</h2>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Anuncio Analizado</h3>
                            <button onClick={resetAnalysis} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border-color)' }}>
                                ↻ Analizar Otro
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

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
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Visual Ad Analyzer</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                                Haz clic aquí o arrastra una captura de pantalla de un anuncio de Facebook, Instagram o TikTok.
                            </p>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <img src={preview} alt="Ad Preview" style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain' }} />
                            {!results && (
                                <button type="button" onClick={() => { setImage(null); setPreview(null); }} style={{ background: 'none', border: 'none', color: 'var(--warning)', textDecoration: 'underline', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    Quitar imagen
                                </button>
                            )}
                        </div>
                    )}

                    {!results && (
                        <>
                            <div className="form-group mb-4">
                                <label style={{ color: 'var(--text-primary)' }}>¿Cuál es TU Producto/Nicho? (Opcional)</label>
                                <textarea
                                    className="form-control"
                                    value={productContext}
                                    onChange={(e) => setProductContext(e.target.value)}
                                    placeholder="ej. Yo vendo consultorías de finanzas personales. Adapta el gancho a mi modelo."
                                    rows="3"
                                    style={{ background: 'var(--bg-secondary)' }}
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Dile a la IA qué vendes tú. Ella extraerá el esqueleto del anuncio arriba y redactará un script adaptado a lo tuyo.</small>
                            </div>

                            <button
                                onClick={analyzeAd}
                                className="btn btn-glow"
                                disabled={!image || isAnalyzing}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                            >
                                {isAnalyzing ? '👁️ Escaneando Psicología...' : '🚀 Reverse Engineer Ad'}
                            </button>
                        </>
                    )}
                </div>

                {/* Analysis Results View */}
                {results && (
                    <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div className="card" style={{ borderColor: 'var(--primary)', borderLeft: '4px solid var(--primary)' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🧠</span> 1. Ingeniería Psicológica
                            </h3>
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                                {results.psychology}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                    <span>👀</span> Gancho Visual
                                </h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {results.hookVisual}
                                </p>
                            </div>
                            <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                    <span>🧲</span> Gancho Textual
                                </h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', fontStyle: 'italic' }}>
                                    "{results.hookTextual}"
                                </p>
                            </div>
                        </div>

                        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                            <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🎁</span> Oferta y Llamado a la Acción Detectado
                            </h3>
                            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                {results.offer}
                            </p>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(145deg, rgba(30,30,40,1) 0%, rgba(20,20,30,1) 100%)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                <span>🔄</span> Blueprint: Framework de Réplica
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                Sigue esta estructura paso a paso para modelar el éxito de este formato en tus propios creativos.
                            </p>
                            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {results.replicationFramework.map((step, index) => (
                                    <li key={index}>
                                        <span style={{ color: 'var(--text-primary)' }}>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="card glass-panel" style={{ borderTop: '2px solid var(--primary)', marginTop: '0.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <span>✍️</span> Propuesta Adaptada para Ti
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Hemos aplicado la ingeniería de este anuncio a <strong>{productContext || 'tu producto general'}</strong>:
                            </p>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '1rem', whiteSpace: 'pre-wrap', color: '#e2e8f0', borderLeft: '3px solid var(--accent-color)' }}>
                                {results.suggestedCopy}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default AdAnalyzer;
