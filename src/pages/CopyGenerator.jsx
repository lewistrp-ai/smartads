import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

function CopyGenerator() {
    const { user, role } = useAuth();
    const [mode, setMode] = useState('ads'); // 'ads' or 'organic'
    const [currentStep, setCurrentStep] = useState(0);

    // Ads Form Data
    const [formData, setFormData] = useState({
        niche: '',
        product: '',
        ticket: '',
        currency: 'USD',
        painPoint: '',
        audience: '',
        temperature: 'frio',
        objective: 'leads',
        tone: 'educativo',
        format: 'video',
        demographics: '',
        benefits: '',
        differentiation: '',
        objections: '',
        guarantee: ''
    });

    // Organic Content Form Data
    const [organicFormData, setOrganicFormData] = useState({
        niche: '',
        audience: '',
        profile: '',
        pillars: '',
        objective: 'viralidad'
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState(null);
    const [organicResults, setOrganicResults] = useState(null);

    // AI Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = React.useRef(null);

    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatting]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOrganicInputChange = (e) => {
        const { name, value } = e.target;
        setOrganicFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, mode === 'ads' ? 5 : 2));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const generateCopy = async (e) => {
        if (e) e.preventDefault();
        setIsGenerating(true);
        setResults(null);
        setChatHistory([]); // Reset chat when generating new copies

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/generate-copy`, formData);
            if (response.data.success) {
                const generatedData = response.data.data;
                setResults(generatedData);

                // Save to history for all authenticated users
                if (user) {
                    const { error } = await supabase
                        .from('copy_history')
                        .insert([
                            {
                                user_id: user.id,
                                campaign_type: formData.objective,
                                inputs: formData,
                                outputs: generatedData
                            }
                        ]);

                    if (error) console.error('Error saving history to Supabase:', error);
                }

                setCurrentStep(6); // Step 6 is the results view
            }
        } catch (error) {
            console.error('Failed to generate copy:', error);
            alert('Error al generar los copies. Asegúrate de que el servidor local y Meta/Gemini APIs estén activos.');
            setCurrentStep(5); // Go back to last step on error
        } finally {
            setIsGenerating(false);
        }
    };

    const generateOrganicContent = async (e) => {
        if (e) e.preventDefault();
        setIsGenerating(true);
        setOrganicResults(null);
        setChatHistory([]); // Reset chat

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/generate-organic`, organicFormData);
            if (response.data.success) {
                setOrganicResults(response.data.data);
                setCurrentStep(3); // Step 3 is results for organic
            }
        } catch (error) {
            console.error('Failed to generate organic content:', error);
            alert('Error al generar el contenido de marca personal. Asegúrate de que el servidor local y Meta/Gemini APIs estén activos.');
            setCurrentStep(2); // Go back to last step
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMessage = { role: 'user', content: chatInput };
        const updatedHistory = [...chatHistory, newUserMessage];

        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatting(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/refine-copy`, {
                message: chatInput,
                copyContext: {
                    inputs: formData,
                    outputs: results
                },
                history: chatHistory
            });

            if (response.data.success) {
                setChatHistory([...updatedHistory, {
                    role: 'ai',
                    content: response.data.reply
                }]);
            }
        } catch (error) {
            console.error("Smarty Chat Error:", error);
            setChatHistory([...updatedHistory, {
                role: 'ai',
                content: '⚠️ Lo siento, tuve un problema analizando esta solicitud. Intenta de nuevo en unos segundos.'
            }]);
        } finally {
            setIsChatting(false);
        }
    };

    const renderProgressBar = () => {
        if (currentStep === 0 || currentStep > 5) return null;
        return (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5].map(step => (
                    <div
                        key={step}
                        style={{
                            height: '6px',
                            flex: 1,
                            backgroundColor: step <= currentStep ? 'var(--accent-color)' : 'var(--border-color)',
                            borderRadius: '3px',
                            transition: 'background-color 0.3s ease'
                        }}
                    />
                ))}
            </div>
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="wizard-step animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🧠</span>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '2rem' }}>
                            Generador Estratégico de Activos Publicitarios
                        </h2>
                        <ul style={{ textAlign: 'left', display: 'inline-block', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            <li>🎯 Ajustado por temperatura del tráfico</li>
                            <li>💰 Optimizado por ticket promedio</li>
                            <li>🤖 Adaptado al objetivo de campaña</li>
                            <li>🧠 Basado en psicología de conversión</li>
                        </ul>
                        <button type="button" className="btn btn-glow" onClick={nextStep} style={{ display: 'block', margin: '0 auto', fontSize: '1.2rem', padding: '1rem 3rem' }}>
                            Iniciar Construcción Estratégica 🚀
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 1: Contexto Estratégico</h2>
                        <div className="form-group mb-4">
                            <label>Nicho de Mercado</label>
                            <input type="text" className="form-control" name="niche" value={formData.niche} onChange={handleInputChange} placeholder="ej. Bienes Raíces, Fitness, Desarrollo Personal..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 El mercado global donde operas. Ayuda a afinar la jerga técnica.</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Producto o Servicio</label>
                            <input type="text" className="form-control" name="product" value={formData.product} onChange={handleInputChange} placeholder="ej. Asesoría 1a1, Software CRM, Curso en línea..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Qué estás vendiendo exactamente. Sé específico (ej. "Bootcamp de 8 semanas" en vez de "Curso").</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>¿Por qué deberían elegirte a ti y no a otro? (Diferenciación)</label>
                            <textarea className="form-control" name="differentiation" value={formData.differentiation} onChange={handleInputChange} placeholder="ej. Único método probado en 30 días, Soporte 24/7 real..." required rows="2" />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Esto nos ayuda a posicionar tu ángulo de autoridad e innovación frente a la competencia.</small>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 2: Oferta y Transformación</h2>
                        <div className="form-group mb-4">
                            <label>Ticket Promedio (Precio)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select className="form-control" name="currency" value={formData.currency} onChange={handleInputChange} style={{ width: '120px' }}>
                                    <option value="USD">USD</option>
                                    <option value="COP">COP</option>
                                </select>
                                <input type="text" className="form-control" name="ticket" value={formData.ticket} onChange={handleInputChange} placeholder={formData.currency === 'USD' ? "ej. 97, 1500 (High Ticket)..." : "ej. 150000, 3000000..."} required style={{ flex: 1 }} />
                            </div>
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 La estrategia cambia drásticamente: Tickets altos requieren más educación y storytelling.</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Problema / Dolor Principal (Pain Point)</label>
                            <input type="text" className="form-control" name="painPoint" value={formData.painPoint} onChange={handleInputChange} placeholder="ej. Trabajan 14h al día, No cierran ventas, Sobrepeso..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 ¿Qué no deja dormir a tu cliente ideal? Este será el gancho principal (Hook).</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Soluciones y Beneficios</label>
                            <textarea className="form-control" name="benefits" value={formData.benefits} onChange={handleInputChange} placeholder="ej. Automatiza tu prospección, Pierde 5kg sin pasar hambre..." required rows="2" />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 ¿Qué transformación real ofreces? Pasamos del "qué" (características) al "para qué" (beneficios).</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Garantía de tu Producto</label>
                            <input type="text" className="form-control" name="guarantee" value={formData.guarantee} onChange={handleInputChange} placeholder="ej. 30 días de devolución, Garantía de resultados por contrato..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 La reducción de riesgo es clave para conversiones altas.</small>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 3: Audiencia y Psicología</h2>
                        <div className="form-group mb-4">
                            <label>Descripción de la Audiencia</label>
                            <input type="text" className="form-control" name="audience" value={formData.audience} onChange={handleInputChange} placeholder="ej. Dueños de agencias cansados, Madres buscando ingresos extra..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 A quién le hablamos. "A quien le hablas a todos, no le hablas a nadie".</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Demografía (Edades, Ubicación, Género)</label>
                            <input type="text" className="form-control" name="demographics" value={formData.demographics} onChange={handleInputChange} placeholder="ej. Mujeres 25-45 años en España y México..." required />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Ayuda a adaptar las expresiones, el contexto local y el tono cultural del copy.</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Objeciones Principales del Cliente</label>
                            <textarea className="form-control" name="objections" value={formData.objections} onChange={handleInputChange} placeholder="ej. Es muy caro, No tengo tiempo, Ya probé de todo e hice efecto rebote..." required rows="2" />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Destruiremos estas excusas directamente dentro del anuncio para evitar dudas irreales.</small>
                        </div>
                        <div className="form-group mb-4">
                            <label>Temperatura del Público</label>
                            <select className="form-control" name="temperature" value={formData.temperature} onChange={handleInputChange}>
                                <option value="frio">❄️ Frío (No te conocen - Necesitan Autoridad)</option>
                                <option value="tibio">🌤️ Tibio (Interactuaron - Necesitan Demostración)</option>
                                <option value="caliente">🔥 Caliente (Carrito Abandonado - Necesitan Oferta)</option>
                            </select>
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Ajusta la agresividad de la venta. Tráfico frío necesita más persuasión.</small>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 4: Tipo de Campaña</h2>
                        <div className="form-group mb-4">
                            <label>Objetivo de tu campaña en Meta Ads</label>
                            <select className="form-control" name="objective" value={formData.objective} onChange={handleInputChange}>
                                <option value="leads">📝 Generación de Clientes Potenciales (Leads / Formularios)</option>
                                <option value="ventas">🛒 Ventas (Conversiones Web / VSL)</option>
                                <option value="mensajes">💬 Interacción (Mensajes DM / WhatsApp)</option>
                            </select>
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.4rem' }}>💡 Modifica el Llamado a la Acción (CTA) para que coincida con el objetivo del algoritmo.</small>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 5: Estilo y Formato Creativo</h2>
                        <div className="form-group mb-4">
                            <label>Tono del Copy</label>
                            <select className="form-control" name="tone" value={formData.tone} onChange={handleInputChange}>
                                <option value="educativo">📚 Educativo / Consultivo (Aporta valor primero)</option>
                                <option value="agresivo">⚡ Agresivo / FOMO (Urgencia, Escasez, Directo)</option>
                                <option value="inspiracional">✨ Inspiracional / Storytelling (Emotivo, Viaje del Héroe)</option>
                            </select>
                        </div>
                        <div className="form-group mb-4">
                            <label>Formato de Anuncio Preferido</label>
                            <select className="form-control" name="format" value={formData.format} onChange={handleInputChange}>
                                <option value="video">🎥 Video Corto (Reels / TikTok style)</option>
                                <option value="imagen">🖼️ Imagen Estática (Copy debe cargar el peso persuasivo)</option>
                                <option value="carrusel">🎠 Carrusel (Historia paso a paso)</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid var(--accent-color)' }}>
                            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                🤖 Smarty redactará de inmediato tus activos publicitarios basados en <strong>{formData.product}</strong> para tráfico <strong>{formData.temperature}</strong>.
                            </p>
                        </div>
                    </div>
                );
            case 6:
                return renderResults(); // The final generated state
            default:
                return null;
        }
    };

    const renderResults = () => {
        if (!results) return null;
        return (
            <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>Resultados: Activos Estratégicos 🚀</h2>
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(0)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        ↺ Iniciar Nueva Estrategia
                    </button>
                </div>

                {/* 1. Hook Principal */}
                <div className="card" style={{ borderColor: 'var(--primary)', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🎯</span> 1. Gancho Principal (Hook)
                    </h3>
                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                        "{results.hooks[0] || 'Hook no generado'}"
                    </div>
                </div>

                {/* 20 Ángulos de Venta */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🧠</span> 20 Ángulos Psicológicos de Venta
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        {results.angles && results.angles.length > 0 ? results.angles.map((angle, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.8rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🔹</span> {angle.name}
                                </h4>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {angle.copy}
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No se generaron ángulos. Intenta de nuevo.</p>
                        )}
                    </div>
                </div>

                {/* CTAs */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📣</span> Llamados a la Acción (Optimizados para {formData.objective})
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {results.ctas && results.ctas.slice(0, 3).map((cta, i) => (
                            <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                                {cta}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guion si es video */}
                {formData.format === 'video' && results.scripts && (
                    <div className="card" style={{ border: '1px solid var(--border-color)', background: 'linear-gradient(to bottom, var(--bg-secondary), rgba(0,0,0,0.2))' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🎬</span> Guion Estructurado (Hook-Story-Offer)
                        </h3>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '0.5rem', fontSize: '0.95rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#e2e8f0', borderLeft: '3px solid var(--primary)' }}>
                            {results.scripts[0] || 'Guion no generado'}
                        </div>
                    </div>
                )}

                {/* AI Chat Module */}
                <div className="card ai-chat-module animate-fade-in" style={{ marginTop: '1rem', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ fontSize: '2.5rem' }}>🤖</div>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem' }}>Smarty (Tu Copywriter AI)</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Pídele variaciones, traducciones o ajustes finos a los copies generados arriba.</p>
                        </div>
                    </div>

                    <div className="chat-window" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                                ¡Hola! Escribe abajo si quieres que ajuste, haga más agresivo, o traduzca alguno de los 20 ángulos de venta para ti. 👇
                            </div>
                        )}
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                padding: '1rem 1.2rem',
                                borderRadius: '1rem',
                                borderBottomRightRadius: msg.role === 'user' ? '0' : '1rem',
                                borderBottomLeftRadius: msg.role === 'ai' ? '0' : '1rem',
                                maxWidth: '85%',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap',
                                border: msg.role === 'ai' ? '1px solid var(--border-color)' : 'none'
                            }}>
                                {msg.content}
                            </div>
                        ))}
                        {isChatting && (
                            <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem 1rem' }}>
                                <span className="typing-indicator">Smarty está reescribiendo...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.8rem' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ej. 'Haz el ángulo de Dolor más agresivo y con emojis'..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                            disabled={isChatting}
                        />
                        <button type="submit" className="btn" disabled={isChatting || !chatInput.trim()} style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>
                            Enviar a Smarty ✨
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const renderOrganicStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="wizard-step animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📱</span>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '2rem' }}>
                            Motor de Contenido y Marca Personal
                        </h2>
                        <ul style={{ textAlign: 'left', display: 'inline-block', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                            <li>🔥 10 Ganchos virales comprobados</li>
                            <li>🎬 5 Guiones de Video completos</li>
                            <li>🎠 3 Estructuras para Carruseles</li>
                            <li>🧠 Basado en tus Pilares de Autoridad</li>
                        </ul>
                        <button type="button" className="btn btn-glow" onClick={nextStep} style={{ display: 'block', margin: '0 auto', fontSize: '1.2rem', padding: '1rem 3rem' }}>
                            Planificar Contenido Orgánico 🚀
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 1: Tu Autoridad</h2>
                        <div className="form-group mb-4">
                            <label>Nicho de Mercado</label>
                            <input type="text" className="form-control" name="niche" value={organicFormData.niche} onChange={handleOrganicInputChange} placeholder="ej. Nutrición Deportiva, Finanzas Personales..." required />
                        </div>
                        <div className="form-group mb-4">
                            <label>Perfil del Creador (Tu Autoridad)</label>
                            <input type="text" className="form-control" name="profile" value={organicFormData.profile} onChange={handleOrganicInputChange} placeholder="ej. Soy Nutricionista con 5 años de experiencia..." required />
                        </div>
                        <div className="form-group mb-4">
                            <label>Audiencia Objetivo</label>
                            <input type="text" className="form-control" name="audience" value={organicFormData.audience} onChange={handleOrganicInputChange} placeholder="ej. Jóvenes que no saben ahorrar, Hombres de 30+..." required />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="wizard-step animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Paso 2: Eje de Contenido</h2>
                        <div className="form-group mb-4">
                            <label>Pilares de Contenido (Temas de los que hablas)</label>
                            <textarea className="form-control" name="pillars" value={organicFormData.pillars} onChange={handleOrganicInputChange} placeholder="ej. 1. Mindset, 2. Rutinas de ejercicio, 3. Mitos de alimentación..." required rows="3" />
                        </div>
                        <div className="form-group mb-4">
                            <label>Objetivo de esta Estrategia</label>
                            <select className="form-control" name="objective" value={organicFormData.objective} onChange={handleOrganicInputChange}>
                                <option value="viralidad">🔥 Alcance y Viralidad (Crecimiento)</option>
                                <option value="autoridad">🧠 Autoridad y Confianza (Fidelización)</option>
                                <option value="conversacion">💬 Entrar en Conversación (Engagement y DMs)</option>
                            </select>
                        </div>
                    </div>
                );
            case 3:
                return renderOrganicResults();
            default:
                return null;
        }
    };

    const renderOrganicResults = () => {
        if (!organicResults) return null;
        return (
            <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>Plan de Contenido Orgánico 📱</h2>
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(0)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        ↺ Nuevo Plan
                    </button>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <span>🎣</span> 10 Ganchos (Hooks) Virales
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: 0, paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
                        {organicResults.viralHooks?.map((hook, i) => (
                            <li key={i} style={{ fontSize: '1.05rem' }}>{hook}</li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                        <span>🎬</span> 5 Guiones de Videos (Reels / TikTok)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {organicResults.videoScripts?.map((script, i) => (
                            <div key={i} style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>{script.title}</h4>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><strong style={{ color: 'var(--primary)' }}>Hook:</strong> {script.hook}</p>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}><strong style={{ color: 'var(--accent-color)' }}>Cuerpo:</strong><br />{script.body}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong style={{ color: 'var(--success)' }}>CTA:</strong> {script.cta}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                        <span>🎠</span> 3 Estructuras de Carruseles Educativos
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {organicResults.carouselOutlines?.map((carousel, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--warning)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>{carousel.title}</h4>
                                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {carousel.slides.map((slide, j) => (
                                        <li key={j} style={{ marginBottom: '0.4rem' }}>{slide}</li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="copy-generator">
            <h1 style={{ textAlign: 'center' }}>{mode === 'ads' ? 'Smart Ads Copy Builder' : 'Smart Content Generator'}</h1>
            {((mode === 'ads' && currentStep < 6) || (mode === 'organic' && currentStep < 3)) && (
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                    {mode === 'ads' ? 'Construye anuncios que convierten diseñándolos paso a paso con nuestra IA estratégica.' : 'Diseña contenido orgánico viral y construye autoridad para tu Marca Personal.'}
                </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button type="button" className={`btn ${mode === 'ads' ? 'btn-glow' : 'btn-secondary'}`} onClick={() => { setMode('ads'); setCurrentStep(0); }}>
                    📣 Anuncios Estratégicos
                </button>
                <button type="button" className={`btn ${mode === 'organic' ? 'btn-glow' : 'btn-secondary'}`} onClick={() => { setMode('organic'); setCurrentStep(0); }}>
                    📱 Marca Personal (Orgánico)
                </button>
            </div>

            <div style={{ maxWidth: ((mode === 'ads' && currentStep < 6) || (mode === 'organic' && currentStep < 3)) ? '600px' : '100%', margin: '0 auto' }}>
                {mode === 'ads' ? renderProgressBar() : null}

                {((mode === 'ads' && currentStep < 6) || (mode === 'organic' && currentStep < 3)) ? (
                    <div className="card glass-panel relative" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            {mode === 'ads' ? renderStep() : renderOrganicStep()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={prevStep}
                                style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
                                disabled={isGenerating}
                            >
                                ← Atrás
                            </button>

                            {((mode === 'ads' && currentStep < 5 && currentStep > 0) || (mode === 'organic' && currentStep < 2 && currentStep > 0)) && (
                                <button type="button" className="btn" onClick={nextStep} disabled={isGenerating}>
                                    Siguiente →
                                </button>
                            )}

                            {mode === 'ads' && currentStep === 5 && (
                                <button type="button" className="btn btn-glow" onClick={generateCopy} disabled={isGenerating} style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>
                                    {isGenerating ? 'Generando Activos...' : '🚀 Generar Activos Publicitarios Especializados'}
                                </button>
                            )}

                            {mode === 'organic' && currentStep === 2 && (
                                <button type="button" className="btn btn-glow" onClick={generateOrganicContent} disabled={isGenerating} style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>
                                    {isGenerating ? 'Generando Contenido...' : '🚀 Creador de Contenido Viral'}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    mode === 'ads' ? renderResults() : renderOrganicResults()
                )}
            </div>
        </div>
    );
}

export default CopyGenerator;
