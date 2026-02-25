import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AISalesAssistant() {
    const { user } = useAuth();

    // Form State (Context)
    const [trainingContext, setTrainingContext] = useState({
        niche: '',
        product: '',
        differentiation: '',
        painPoint: '',
        benefits: '',
        guarantee: '',
        audienceDesc: '',
        demographics: '',
        objections: '',
        salesRole: 'Consultivo/Educativo',
        tone: 'Profesional y Empático'
    });

    const [isTrained, setIsTrained] = useState(false);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTrainingContext(prev => ({ ...prev, [name]: value }));
    };

    const handleTrainAssistant = (e) => {
        e.preventDefault();
        setIsTrained(true);
        // Start conversation
        setMessages([
            {
                role: 'model',
                text: `¡Listo! He memorizado todo el contexto sobre tu producto (${trainingContext.product}). Soy tu nuevo Vendedor IA con un tono ${trainingContext.tone}. ¿Cómo te puedo ayudar hoy o qué objeción quieres que practiquemos?`
            }
        ]);
    };

    const resetTraining = () => {
        setIsTrained(false);
        setMessages([]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newUserMsg = { role: 'user', text: inputMessage };
        const updatedHistory = [...messages, newUserMsg];

        setMessages(updatedHistory);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/sales-assistant`, {
                trainingContext,
                history: updatedHistory
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: 'Error: No pude procesar la respuesta. Intenta de nuevo.' }]);
            }
        } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Vaya, parece que hay un error de conexión con mi cerebro artificial. Revisa la consola o intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 2rem 1rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>🗣️ Entrenador de Ventas IA</h1>
                <p className="subtitle" style={{ margin: 0, maxWidth: '800px' }}>
                    Entrena a tu propio vendedor virtual con los datos exactos de tu negocio y ponlo a prueba respondiendo dudas u objeciones de clientes.
                </p>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '2rem', padding: '0 2rem 2rem', overflow: 'hidden' }}>

                {/* Panel Izquierdo: Formulario de Entrenamiento */}
                <div className="card glass-panel" style={{ flex: '0 0 400px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                            Base de Conocimiento
                        </h3>
                        {isTrained && (
                            <button onClick={resetTraining} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                ↻ Reentrenar
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleTrainAssistant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: isTrained ? 0.6 : 1, pointerEvents: isTrained ? 'none' : 'auto' }}>

                        <div className="form-group">
                            <label>Producto o Servicio</label>
                            <input type="text" className="form-control" name="product" value={trainingContext.product} onChange={handleInputChange} placeholder="Ej. Curso de Marketing, Zapatos de Cuero..." required />
                        </div>

                        <div className="form-group">
                            <label>Nicho de Mercado</label>
                            <input type="text" className="form-control" name="niche" value={trainingContext.niche} onChange={handleInputChange} placeholder="Ej. Salud y Fitness, Real Estate..." required />
                        </div>

                        <div className="form-group">
                            <label>¿Por qué elegirte a ti? (Diferenciación)</label>
                            <textarea className="form-control" name="differentiation" value={trainingContext.differentiation} onChange={handleInputChange} placeholder="Ej. Único con metodología comprobada de 3 pasos..." rows="2" required></textarea>
                        </div>

                        <div className="form-group">
                            <label>Problema o Dolor Principal del Cliente</label>
                            <textarea className="form-control" name="painPoint" value={trainingContext.painPoint} onChange={handleInputChange} placeholder="Ej. Gastan mucho en anuncios sin ver retorno..." rows="2" required></textarea>
                        </div>

                        <div className="form-group">
                            <label>Soluciones y Beneficios Exactos</label>
                            <textarea className="form-control" name="benefits" value={trainingContext.benefits} onChange={handleInputChange} placeholder="Ej. Recuperación de inversión en 30 días, ahorro de tiempo..." rows="2" required></textarea>
                        </div>

                        <div className="form-group">
                            <label>Garantía de tu Producto</label>
                            <input type="text" className="form-control" name="guarantee" value={trainingContext.guarantee} onChange={handleInputChange} placeholder="Ej. Garantía incondicional de 14 días" required />
                        </div>

                        <div className="form-group">
                            <label>Audiencia y Demografía</label>
                            <input type="text" className="form-control" name="demographics" value={trainingContext.demographics} onChange={handleInputChange} placeholder="Ej. Dueños de agencias, 25-45 años, América Latina" required />
                        </div>

                        <div className="form-group">
                            <label>Objeciones Frecuentes a Vencer</label>
                            <textarea className="form-control" name="objections" value={trainingContext.objections} onChange={handleInputChange} placeholder="Ej. Es muy caro, no tengo tiempo, ya probé algo igual..." rows="2" required></textarea>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0', paddingTop: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Personalidad del Vendedor</h4>

                            <div className="form-group">
                                <label>Rol / Tipo de Vendedor</label>
                                <select className="form-control" name="salesRole" value={trainingContext.salesRole} onChange={handleInputChange}>
                                    <option value="Consultivo/Educativo">Consultivo y Educativo (Guía paso a paso)</option>
                                    <option value="Cierre Agresivo (Closer)">Closer Agresivo (Enfoque en cierre rápido)</option>
                                    <option value="Servicio al Cliente">Servicio al Cliente (Amable y paciente)</option>
                                    <option value="Experto Técnico">Experto Técnico (Basado en datos técnicos)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tono y Contexto Cultural</label>
                                <input type="text" className="form-control" name="tone" value={trainingContext.tone} onChange={handleInputChange} placeholder="Ej. Profesional, Casual, Jerga y amigable, Español neutro..." required />
                            </div>
                        </div>

                        {!isTrained && (
                            <button type="submit" className="btn btn-glow" style={{ marginTop: '1rem' }}>
                                🧠 Inyectar Conocimiento a la IA
                            </button>
                        )}
                        {isTrained && (
                            <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                                ✅ Vendedor IA Entrenado
                            </div>
                        )}
                    </form>
                </div>

                {/* Panel Derecho: Interfaz de Chat interactiva */}
                <div className="card glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span>
                            Chat de Simulación de Ventas
                        </h3>
                        {isTrained && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--success)' }}>En línea - Listo para conversar</p>}
                    </div>

                    <div className="chat-messages" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isTrained ? (
                            <div style={{ mauto: 'auto', textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 2rem' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12"></path>
                                </svg>
                                <h3>Esperando entrenamiento...</h3>
                                <p>Llena el formulario de la izquierda con los datos de tu producto y haz clic en "Inyectar Conocimiento" para iniciar el simulador.</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                        border: msg.role === 'model' ? '1px solid var(--border-color)' : 'none',
                                        color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '1rem',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '1rem',
                                        borderBottomLeftRadius: msg.role === 'model' ? '4px' : '1rem',
                                        maxWidth: '85%',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ alignSelf: 'flex-start', padding: '1rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', borderBottomLeftRadius: '4px', display: 'flex', gap: '0.4rem' }}>
                                        <span className="dot-typing"></span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-control"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={isTrained ? "Escribe como si fueras el cliente (ej. '¿Cuánto vale?', 'Es muy caro')..." : "Entrena a la IA primero para chatear..."}
                                disabled={!isTrained || isLoading}
                                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}
                            />
                            <button
                                type="submit"
                                className="btn"
                                disabled={!isTrained || !inputMessage.trim() || isLoading}
                                style={{ backgroundColor: 'var(--primary)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            {/* Adding the styles for the typing animation locally */}
            <style>
                {`
               .dot-typing {
                    position: relative;
                    left: -9999px;
                    width: 6px;
                    height: 6px;
                    border-radius: 5px;
                    background-color: transparent;
                    color: var(--text-secondary);
                    box-shadow: 9984px 0 0 0 var(--text-secondary), 9999px 0 0 0 var(--text-secondary), 10014px 0 0 0 var(--text-secondary);
                    animation: dot-typing 1.5s infinite linear;
                }
                @keyframes dot-typing {
                    0% {
                        box-shadow: 9984px 0 0 0 var(--text-secondary), 9999px 0 0 0 var(--text-secondary), 10014px 0 0 0 var(--text-secondary);
                    }
                    16.667% {
                        box-shadow: 9984px -6px 0 0 var(--primary), 9999px 0 0 0 var(--text-secondary), 10014px 0 0 0 var(--text-secondary);
                    }
                    33.333% {
                        box-shadow: 9984px 0 0 0 var(--text-secondary), 9999px -6px 0 0 var(--primary), 10014px 0 0 0 var(--text-secondary);
                    }
                    50% {
                        box-shadow: 9984px 0 0 0 var(--text-secondary), 9999px 0 0 0 var(--text-secondary), 10014px -6px 0 0 var(--primary);
                    }
                    66.667% {
                        box-shadow: 9984px 0 0 0 var(--text-secondary), 9999px 0 0 0 var(--text-secondary), 10014px 0 0 0 var(--text-secondary);
                    }
                }
               `}
            </style>
        </div>
    );
}

export default AISalesAssistant;
