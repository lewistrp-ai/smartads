import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function BusinessCoach() {
    // 1. Business Profile State (Left Panel)
    const [profile, setProfile] = useState({
        niche: '',
        avatar: '',
        offer: '',
        revenue: '',
        goal: '',
        bottleneck: ''
    });

    const [isProfileSaved, setIsProfileSaved] = useState(false);

    // Load from local storage on mount so they don't lose it between sessions
    useEffect(() => {
        const savedProfile = localStorage.getItem('smartAdsBusinessProfile');
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
            setIsProfileSaved(true);
        }
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setIsProfileSaved(false); // They made a change, need to save again
    };

    const saveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('smartAdsBusinessProfile', JSON.stringify(profile));
        setIsProfileSaved(true);
        // Add a system welcome message if chat is empty
        if (chatHistory.length === 0) {
            setChatHistory([{
                role: 'ai',
                content: `¡Excelente! He guardado el perfil de tu negocio en **${profile.niche}**. Como tu Coach y Project Manager, mi objetivo es ayudarte a resolver ese cuello de botella con **${profile.bottleneck}** y alcanzar tu meta de **${profile.goal}**.\n\n¿En qué nos enfocamos hoy? ¿Estructurar un servicio, armar un roadmap o resolver un problema de equipo?`
            }]);
        }
    };

    // 2. Chat State (Right Panel)
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatting]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMessage = { role: 'user', content: chatInput };
        const updatedHistory = [...chatHistory, newUserMessage];

        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatting(true);

        try {
            // Filter out system greetings or errors from the history sent to the LLM
            // Gemini requires the first message in history to be from 'user'.
            const cleanHistory = chatHistory.filter(msg =>
                !(msg.role === 'ai' && msg.content.includes('Contexto Memorizado')) &&
                !(msg.role === 'ai' && msg.content.includes('He guardado el perfil')) &&
                !(msg.role === 'ai' && msg.content.includes('Hubo un error'))
            );

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/business-coach`, {
                message: chatInput,
                profileContext: isProfileSaved ? profile : null, // Send context only if it's "saved/active"
                history: cleanHistory
            });

            if (response.data.success) {
                setChatHistory([...updatedHistory, {
                    role: 'ai',
                    content: response.data.reply
                }]);
            }
        } catch (error) {
            console.error("Coach Chat Error:", error);
            setChatHistory([...updatedHistory, {
                role: 'ai',
                content: '⚠️ Hubo un error de conexión con mi sistema central. Revisa que el backend esté corriendo e intenta de nuevo.'
            }]);
        } finally {
            setIsChatting(false);
        }
    };

    const clearChat = () => {
        if (window.confirm('¿Seguro que quieres borrar el historial de esta sesión?')) {
            setChatHistory([]);
        }
    };

    return (
        <div className="business-coach animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Smart Business Coach 🧠</h1>
                    <p className="subtitle" style={{ margin: '0.5rem 0 0 0' }}>Tu Project Manager y estratega de negocios personal, siempre al tanto de tu contexto.</p>
                </div>
                {chatHistory.length > 0 && (
                    <button onClick={clearChat} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        🗑️ Limpiar Chat
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* LEFT PANEL: Business Context Profile */}
                <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🗂️</span>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Contexto del Negocio</h2>
                    </div>

                    <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nicho / Industria</label>
                            <input type="text" className="form-control" name="niche" value={profile.niche} onChange={handleProfileChange} placeholder="ej. Agencia de Marketing Médico" required style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente Ideal (Avatar)</label>
                            <input type="text" className="form-control" name="avatar" value={profile.avatar} onChange={handleProfileChange} placeholder="ej. Cirujanos Plásticos en México" required style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oferta / Servicio Principal</label>
                            <input type="text" className="form-control" name="offer" value={profile.offer} onChange={handleProfileChange} placeholder="ej. Sistema de Captación de Pacientes" required style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nivel de Facturación</label>
                            <select className="form-control" name="revenue" value={profile.revenue} onChange={handleProfileChange} style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                                <option value="">Selecciona una etapa...</option>
                                <option value="Iniciando ($0 - $2k/mo)">Iniciando ($0 - $2k/mes)</option>
                                <option value="Creciendo ($2k - $10k/mo)">Creciendo ($2k - $10k/mes)</option>
                                <option value="Escalando ($10k - $50k/mo)">Escalando ($10k - $50k/mes)</option>
                                <option value="Agencia Madura (+$50k/mo)">Agencia Madura (+$50k/mes)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meta a Corto Plazo</label>
                            <input type="text" className="form-control" name="goal" value={profile.goal} onChange={handleProfileChange} placeholder="ej. Cerrar 3 clientes High Ticket este mes" required style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--warning)' }}>Cuello de Botella Principal</label>
                            <textarea className="form-control" name="bottleneck" value={profile.bottleneck} onChange={handleProfileChange} placeholder="¿Qué te detiene hoy? (ej. No tengo leads, cierro poco, mi equipo es ineficiente...)" rows="3" required style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', resize: 'vertical' }}></textarea>
                        </div>

                        <button type="submit" className="btn btn-glow" style={{ marginTop: 'auto', padding: '1rem', background: isProfileSaved ? 'var(--success)' : 'var(--primary)' }}>
                            {isProfileSaved ? '✅ Contexto Memorizado' : '🧠 Memorizar Contexto'}
                        </button>
                    </form>
                </div>

                {/* RIGHT PANEL: Coach Chat */}
                <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', position: 'relative' }}>

                    {/* Chat Area */}
                    <div className="chat-window" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {chatHistory.length === 0 && !isProfileSaved && (
                            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🧠</span>
                                <h3>Hola, soy Smarty Coach.</h3>
                                <p>Para darte consejos hiper-precisos, necesito conocerte. **Llena tu Perfil de Negocio en el panel de la izquierda y presiona Memorizar.**</p>
                            </div>
                        )}

                        {chatHistory.length === 0 && isProfileSaved && (
                            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚀</span>
                                <h3>Contexto Cargado.</h3>
                                <p>Estoy listo para ayudarte a estructurar tus servicios, resolver tus cuellos de botella y crear un roadmap de escalado.</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '1rem', fontStyle: 'italic' }}>Escribe tu primer mensaje abajo.</p>
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                padding: '1.2rem',
                                borderRadius: '1rem',
                                borderBottomRightRadius: msg.role === 'user' ? '0' : '1rem',
                                borderBottomLeftRadius: msg.role === 'ai' ? '0' : '1rem',
                                maxWidth: '85%',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                whiteSpace: 'pre-wrap',
                                border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                boxShadow: msg.role === 'ai' ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
                            }}>
                                {msg.role === 'ai' && <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Smarty Coach</div>}
                                {msg.content}
                            </div>
                        ))}

                        {isChatting && (
                            <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem 1rem' }}>
                                <span className="typing-indicator">El Coach está analizando tu negocio...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)', borderBottomLeftRadius: '0.8rem', borderBottomRightRadius: '0.8rem' }}>
                        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={isProfileSaved ? "Pregunta sobre precios, roadmaps, gestión de equipo..." : "Primero guarda tu contexto a la izquierda..."}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem' }}
                                disabled={isChatting || !isProfileSaved}
                            />
                            <button type="submit" className="btn btn-glow" disabled={isChatting || !chatInput.trim() || !isProfileSaved} style={{ padding: '0 2rem', fontWeight: 'bold' }}>
                                Enviar 🚀
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default BusinessCoach;
