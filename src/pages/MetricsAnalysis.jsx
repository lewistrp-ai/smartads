import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

function MetricsAnalysis() {
    const { user, role } = useAuth();
    const [metrics, setMetrics] = useState({
        cpm: '',
        ctr: '',
        cpc: '',
        cpr: '',
        results: '',
        spend: '',
        roas: ''
    });

    const [diagnosis, setDiagnosis] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // Campaign Selector State
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);

    // AI Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = React.useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isChatting]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMetrics(prev => ({ ...prev, [name]: value }));
    };

    // 1. Fetch Campaigns List
    const fetchCampaigns = async () => {
        setIsFetchingCampaigns(true);
        setFetchError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meta/campaigns`);
            const data = response.data;
            if (data.success && data.campaigns.length > 0) {
                setCampaigns(data.campaigns);
                setSelectedCampaignId(data.campaigns[0].id); // Auto-select first
            } else {
                setFetchError('No se encontraron campañas activas/pausadas.');
            }
        } catch (error) {
            setFetchError('Error conectando con Facebook. Verifica tus API Keys.');
            console.error(error);
        } finally {
            setIsFetchingCampaigns(false);
        }
    };

    // 2. Fetch Specific Campaign Insights
    const fetchFromMetaAPI = async () => {
        setIsFetching(true);
        setFetchError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/meta/insights`, {
                campaignId: selectedCampaignId || undefined // undefined defaults to account level in backend if empty
            });
            const data = response.data;

            if (data.success) {
                setMetrics({
                    cpm: data.insights.cpm || '',
                    ctr: data.insights.ctr || '',
                    cpc: data.insights.cpc || '',
                    cpr: data.insights.cpr || '',
                    results: data.insights.results || '',
                    spend: data.insights.spend || '',
                    roas: metrics.roas
                });
                setDiagnosis(null);
            } else {
                setFetchError('No se encontraron datos en el periodo.');
            }
        } catch (error) {
            setFetchError('Error conectando con Facebook. Verifica que el servidor está encendido y tiene las API Keys.');
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    const analyzeMetrics = async (e) => {
        e.preventDefault();

        const ctr = parseFloat(metrics.ctr) || 0;
        const cpm = parseFloat(metrics.cpm) || 0;
        const cpc = parseFloat(metrics.cpc) || 0;
        const cpr = parseFloat(metrics.cpr) || 0;
        const results = parseFloat(metrics.results) || 0;

        // Atracción
        let attrStatus = 'success';
        let attrText = 'El anuncio está captando muy bien la atención a un costo de impresión razonable.';
        let attrRecs = ['Mantén creativos similares y el mismo ángulo de comunicación.'];
        if (ctr < 1.0) {
            attrStatus = 'danger';
            attrText = 'El CTR (Porcentaje de Clics) es muy bajo (menos del 1%). Las personas no se sienten atraídas para hacer clic en el anuncio.';
            attrRecs = ['Prueba nuevos hooks (Ganchos) visuales o de texto en los primeros 3 segundos.', 'Cambia el ángulo o promesa en el copy de manera más enfática.'];
        } else if (cpm > 15) {
            attrStatus = 'warning';
            attrText = 'Tu CPM es elevado. Estás compitiendo en una subasta publicitaria muy cara o la audiencia es engañosamente pequeña/saturada.';
            attrRecs = ['Amplía tu público usando Segmentación Abierta (Broad) o Lookalikes expansivos.', 'Renueva creativos para subir tu Score de Relevancia en Meta.'];
        }

        // Consideración
        let consStatus = 'success';
        let consText = 'El tráfico hacia la página es económico (Buen CPC). El puente Anuncio-Página funciona.';
        let consRecs = ['Escala agregando variaciones gráficas ligeras para mantener el CPC bajo.'];
        if (cpc > 0.8) {
            consStatus = 'warning';
            consText = 'Estás pagando mucho por cada visitante individual a la página (CPC alto).';
            consRecs = ['El CTR influye directamente aquí: diseña creativos que llamen más al Clic para abaratar el CPC.', 'Crea CTAs (Call To Action) más claros que inviten a ir a la web.'];
        }

        // Conversión
        let convStatus = 'success';
        let convText = 'El costo por resultado es rentable con buenos volúmenes de conversión.';
        let convRecs = ['La campaña es escalable. Aumenta el presupuesto diario un 20%.'];
        if (results === 0 || cpr > 10) {
            convStatus = 'danger';
            convText = `Las personas hacen clic pero no terminan el proceso de compra / registro. El Costo por Resultado es alto (>$10) o los Resultados son bajos.`;
            convRecs = ['Garantiza que la promesa del anuncio coincida exactamente con lo visto en la Landing Page (Continuidad Visual).', 'Mejora la velocidad de carga web (Punto crítico de fuga).', 'Agrega más elementos de escasez natural, urgencia y prueba social.'];
        }

        let overall = (attrStatus === 'danger' || consStatus === 'danger' || convStatus === 'danger') ? 'danger' : 'success';

        const newDiagnosis = {
            stages: [
                { name: '1. Etapa de Atracción (Redes/Facebook)', status: attrStatus, text: attrText, recs: attrRecs },
                { name: '2. Etapa de Consideración (Puente Anuncio - Web)', status: consStatus, text: consText, recs: consRecs },
                { name: '3. Etapa de Conversión (Página de Destino)', status: convStatus, text: convText, recs: convRecs }
            ],
            overall,
            summary: overall === 'danger' ? '🚨 Hay etapas críticas en tu embudo que están filtrando dinero o encareciendo tus resultados. Revísalas detenedidamente a continuación:' : '✅ Tu campaña y embudo están fluyendo de maravilla. Gran alineación de mensaje a mercado.'
        };

        setDiagnosis(newDiagnosis);

        // Save to history for all authenticated users
        if (user) {
            const { error } = await supabase
                .from('metrics_analysis')
                .insert([
                    {
                        user_id: user.id,
                        campaign_id: selectedCampaignId || 'Análisis Manual',
                        inputs: metrics,
                        ai_diagnosis: newDiagnosis
                    }
                ]);

            if (error) console.error('Error saving diagnosis to Supabase:', error);
        }

        // Initialize chat context message
        setChatHistory([{
            role: 'ai',
            content: '¡Hola! Soy **Smarty 🤖**, tu AI Media Buyer personal. He revisado tu campaña y el diagnóstico de arriba. ¿En qué te gustaría que profundicemos hoy para escalar tus ventas? 🚀'
        }]);
    };

    const handleQuickAction = (actionText) => {
        setChatInput(actionText);
        // We use a small timeout to let the state update before submitting
        setTimeout(() => {
            const formEvent = { preventDefault: () => { } };
            submitChat(actionText, formEvent);
        }, 50);
    };

    const handleChatSubmit = async (e) => {
        submitChat(chatInput, e);
    };

    const submitChat = async (messageText, e) => {
        e.preventDefault();
        if (!messageText.trim() || !diagnosis) return;

        const newUserMessage = { role: 'user', content: messageText };
        const updatedHistory = [...chatHistory, newUserMessage];

        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatting(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/analyze`, {
                message: newUserMessage.content,
                metricsContext: { ...metrics, diagnosis },
                history: chatHistory
            });

            if (response.data.success) {
                setChatHistory([...updatedHistory, {
                    role: 'ai',
                    content: response.data.reply
                }]);
            }
        } catch (error) {
            console.error(error);
            setChatHistory([...updatedHistory, {
                role: 'ai',
                content: 'Lo siento, hubo un error de conexión con mi cerebro artificial. Intenta de nuevo en unos segundos.'
            }]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="metrics-analysis">
            <h1>Diagnóstico de Métricas (Embudos)</h1>
            <p className="subtitle">Descubre exactamente dónde estás perdiendo dinero y cómo solucionarlo.</p>

            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: diagnosis ? '1fr 1fr' : '1fr', maxWidth: diagnosis ? '100%' : '600px' }}>

                {/* Form */}
                <div className="card">
                    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>

                        {/* Campaign Selector Area */}
                        {campaigns.length === 0 ? (
                            <button
                                type="button"
                                className="btn"
                                onClick={fetchCampaigns}
                                disabled={isFetchingCampaigns}
                                style={{ width: '100%', backgroundColor: '#1877F2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                {isFetchingCampaigns ? 'Buscando campañas...' : 'Conectar con Facebook'}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selecciona una Campaña a diagnosticar:</label>
                                <select
                                    className="form-control"
                                    value={selectedCampaignId}
                                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                                >
                                    <option value="">-- Toda la cuenta (Promedio global) --</option>
                                    {campaigns.map(camp => (
                                        <option key={camp.id} value={camp.id}>
                                            {camp.status === 'ACTIVE' ? '🟢' : '⚪'} {camp.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={fetchFromMetaAPI}
                                    disabled={isFetching}
                                    style={{ width: '100%', borderColor: '#1877F2', color: '#1877F2' }}
                                >
                                    {isFetching ? 'Extrayendo métricas...' : 'Extraer Métricas de esta Campaña'}
                                </button>
                            </div>
                        )}

                        {fetchError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>{fetchError}</p>}
                    </div>

                    <form onSubmit={analyzeMetrics}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>CPM ($) - Costo por Mil</label>
                                <input type="number" step="0.01" className="form-control" name="cpm" value={metrics.cpm} onChange={handleInputChange} placeholder="ej. 8.50" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>CTR (%) - Click Through Rate</label>
                                <input type="number" step="0.01" className="form-control" name="ctr" value={metrics.ctr} onChange={handleInputChange} placeholder="ej. 1.2" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>CPC ($) - Costo por Clic</label>
                                <input type="number" step="0.01" className="form-control" name="cpc" value={metrics.cpc} onChange={handleInputChange} placeholder="ej. 0.40" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Costo por Resultado ($)</label>
                                <input type="number" step="0.01" className="form-control" name="cpr" value={metrics.cpr} onChange={handleInputChange} placeholder="ej. 3.50" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Resultados (Leads/Compras)</label>
                                <input type="number" step="0.01" className="form-control" name="results" value={metrics.results} onChange={handleInputChange} placeholder="ej. 45" />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Importe Gastado ($)</label>
                                <input type="number" step="0.01" className="form-control" name="spend" value={metrics.spend} onChange={handleInputChange} placeholder="ej. 150" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>ROAS (Opcional - E-commerce)</label>
                            <input type="number" step="0.01" className="form-control" name="roas" value={metrics.roas} onChange={handleInputChange} placeholder="ej. 2.5" />
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                            🔎 Analizar Embudo Completo
                        </button>
                    </form>
                </div>

                {/* Results */}
                {diagnosis && (
                    <div className="results-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card" style={{ borderColor: diagnosis.overall === 'danger' ? 'var(--danger)' : 'var(--success)', borderWidth: '2px' }}>
                            <h2 style={{ color: diagnosis.overall === 'danger' ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem' }}>
                                Análisis Detallado del Embudo
                            </h2>
                            <p style={{ fontSize: '1.05rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                                {diagnosis.summary}
                            </p>

                            <div className="stages" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {diagnosis.stages.map((stage, idx) => (
                                    <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: `4px solid var(--${stage.status})` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{stage.name}</h3>
                                            <span className={`badge badge-${stage.status}`}>{stage.status === 'success' ? 'Óptimo' : stage.status === 'warning' ? 'Precaución' : 'Crítico'}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{stage.text}</p>
                                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                            {stage.recs.map((r, i) => <li key={i} style={{ color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{r}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Chat Module */}
                        <div className="card ai-chat-module" style={{ marginTop: '1rem', border: '1px solid #1877F2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                                <h3 style={{ margin: 0, color: '#1877F2' }}>Smarty (Tu AI Media Buyer)</h3>
                            </div>

                            <div className="chat-window" style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                                {chatHistory.map((msg, i) => (
                                    <div key={i} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        backgroundColor: msg.role === 'user' ? '#1877F2' : 'var(--bg-secondary)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        maxWidth: '85%',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.4'
                                    }}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\ng/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                                    </div>
                                ))}
                                {isChatting && (
                                    <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                        <span className="typing-indicator">Smarty está analizando los datos</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Quick Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => handleQuickAction('Dime 3 ideas súper creativas para bajar mi CPM actual. 💡')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}>
                                    💡 3 Ideas para bajar CPM
                                </button>
                                <button type="button" onClick={() => handleQuickAction('Explícame mi mayor cuello de botella como si tuviera 5 años, con una analogía divertida. 👶')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}>
                                    👶 Explicar fácil
                                </button>
                                <button type="button" onClick={() => handleQuickAction('Escríbeme 2 ganchos (Hooks) agresivos para TikTok basados en estos números. 🎬')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}>
                                    🎬 Escribir Guiones
                                </button>
                            </div>

                            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Escribe tu pregunta a Smarty..."
                                    style={{ flex: 1, marginBottom: 0 }}
                                    disabled={isChatting}
                                />
                                <button type="submit" className="btn" disabled={isChatting || !chatInput.trim()} style={{ padding: '0.5rem 1rem' }}>
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default MetricsAnalysis;
