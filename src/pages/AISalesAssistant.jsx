import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AISalesAssistant() {
    const { user } = useAuth();

    // Form State (Context)
    const [trainingContext, setTrainingContext] = useState('');

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
        setTrainingContext(e.target.value);
    };

    const handleTrainAssistant = (e) => {
        e.preventDefault();
        if (!trainingContext.trim()) return;
        setIsTrained(true);
        // Start conversation
        setMessages([
            {
                role: 'model',
                text: '¡Listo! He procesado todo tu entrenamiento y me he puesto en personaje. ¿Hola, en qué te puedo ayudar hoy?'
            }
        ]);
    };

    const resetTraining = () => {
        setIsTrained(false);
        setMessages([]);
        setTrainingContext('');
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
                    Entrena a tu propio vendedor virtual con un prompt directo y ponlo a prueba respondiendo dudas u objeciones simuladas.
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

                    <form onSubmit={handleTrainAssistant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, opacity: isTrained ? 0.6 : 1, pointerEvents: isTrained ? 'none' : 'auto' }}>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label>Prompt de Entrenamiento del Vendedor</label>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Describe aquí el nicho, producto, dolor principal del cliente, los precios y cómo quieres que responda el vendedor (si es formal, amigable o agresivo).
                            </p>
                            <textarea
                                className="form-control"
                                value={trainingContext}
                                onChange={handleInputChange}
                                placeholder="Ej: Eres un vendedor de Zapatos de Cuero en Colombia. El precio es de $800.000 COP. Tus clientes son ejecutivos y se quejan de que los zapatos se dañan rápido. Tu objetivo es recordarles nuestra garantía de 10 años y sonar muy amable e insistente..."
                                style={{ flex: 1, minHeight: '300px', resize: 'none' }}
                                required
                            />
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
