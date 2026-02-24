import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function CampaignStructure() {
    const [formData, setFormData] = useState({
        objective: 'mensajes',
        budget: '',
        currency: 'USD',
        knowledge: 'principiante',
        phase: 'testeo'
    });

    const [structure, setStructure] = useState(null);
    const [viewMode, setViewMode] = useState('map');
    const [completedSteps, setCompletedSteps] = useState({});

    // AI Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatting]);

    const toggleStep = (id) => {
        setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateStructure = (e) => {
        e.preventDefault();

        const bgt = parseFloat(formData.budget) || 0;
        const isAdvanced = formData.knowledge === 'avanzado';
        const isTesting = formData.phase === 'testeo';

        const currencySymbol = formData.currency === 'COP' ? 'COP $' : '$';
        const formatMoney = (val) => {
            if (formData.currency === 'COP') {
                return `${currencySymbol}${val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            }
            return `${currencySymbol}${val.toFixed(2)}`;
        };

        let prospectingSets = [];
        let warmSets = [];
        let retargetingSets = [];
        let objectiveDesc = '';
        let rationaleDesc = '';

        if (formData.objective === 'mensajes') {
            objectiveDesc = 'Optimizado para Enviar Mensajes Múltiples (WhatsApp/IG)';
            rationaleDesc = isTesting
                ? `En fase de Testeo, buscamos identificar el ángulo y la audiencia. El 70% asegura descubrimiento con múltiples conjuntos ABO, mientras el 30% restante ataca a quienes interactuaron pero no escribieron.`
                : `En fase de Escalado, consolidamos presupuesto en los ganadores. El 70% se invierte en campañas CBO con audiencias amplias (Broad) y el 30% refuerza conversiones con retargeting caliente.`;

            prospectingSets = isTesting ? [
                { name: 'Intereses Directos 1 (ABO)', adsCount: 3 },
                { name: 'Intereses Directos 2 (ABO)', adsCount: 3 },
                { name: 'Público Similar 1% (ABO)', adsCount: 3 }
            ] : [
                { name: 'Abierto / Broad (CBO Ganador)', adsCount: 5 },
                { name: 'Lookalike 1-3% (CBO)', adsCount: 4 }
            ];
            warmSets = [{ name: 'Interactuaron 90d', adsCount: 2 }];
            retargetingSets = [{ name: 'Mensajes Anteriores (Dudas)', adsCount: 2 }];

        } else if (formData.objective === 'leads') {
            objectiveDesc = 'Optimizado para Captación de Leads B2B o High Ticket';
            rationaleDesc = isTesting
                ? `En Testeo B2B validamos el Lead Magnet. Invertiremos el 70% en segmentaciones variadas (ABO) para encontrar el lead más barato y calificado.`
                : `Escalado B2B: Concentramos presupuesto (CBO) en las audiencias e intereses que ya traen leads a buen costo. El retargeting (30%) muestra fuerte autoridad y testimonios para cerrar.`;

            prospectingSets = isTesting ? [
                { name: 'Interés Autoridad 1 (ABO)', adsCount: 3 },
                { name: 'Interés Sector 2 (ABO)', adsCount: 3 },
                { name: 'Broad Segmentado (ABO)', adsCount: 3 }
            ] : [
                { name: 'Lead Lookalike + Broad (CBO)', adsCount: 6 }
            ];
            warmSets = [{ name: 'Visitas a Landing Page', adsCount: 2 }];
            retargetingSets = [{ name: 'Abrieron Formulario Sin Enviar', adsCount: 3 }];

        } else {
            objectiveDesc = 'Optimizado para Ventas de E-Commerce (API de Conversiones)';
            rationaleDesc = isTesting
                ? `Testeo E-commerce: El 70% se destina a campañas ABO probando nuevos creativos y ángulos sobre intereses y lookalikes separados para aislar variables.`
                : `Escalado E-commerce: Metemos fuerza al algoritmo. El 70% va directo a Advantage+ Shopping o CBO Abierto con creativos validados. 30% agresivo en DPA (Catálogo).`;

            prospectingSets = isTesting ? [
                { name: 'Interés Principal', adsCount: 3 },
                { name: 'Lookalike Compradores 1%', adsCount: 3 },
                { name: 'Interés Secundario', adsCount: 3 }
            ] : [
                { name: 'Advantage+ Shopping (CBO)', adsCount: 6 }
            ];
            warmSets = [{ name: 'ViewContent / AddToCart 90d', adsCount: 2 }];
            retargetingSets = [{ name: 'Ventas de Catálogo Dinámico (DPA)', adsCount: 4 }];
        }

        const buildCampaign = (title, pct, sets, color, type) => {
            const campBudget = bgt * pct;
            const isCBO = sets.length > 1 && type === 'prospecting' && bgt > 50;
            const adsetBudget = campBudget / sets.length;

            return {
                title,
                budgetSplit: `${pct * 100}% del Presupuesto`,
                budgetVal: formatMoney(campBudget),
                isCBO,
                color,
                adsets: sets.map(s => {
                    const adBgt = adsetBudget / s.adsCount;
                    const adsList = Array.from({ length: s.adsCount }, (_, i) => ({
                        name: `Anuncio ${i + 1}`,
                        budget: formatMoney(adBgt)
                    }));
                    return {
                        name: s.name,
                        budget: formatMoney(adsetBudget),
                        ads: adsList
                    };
                })
            };
        };

        const generatedStructure = {
            objectiveString: objectiveDesc,
            rationale: rationaleDesc,
            campaigns: [
                buildCampaign('🔵 Campaña 1: Prospecting (Frío)', 0.70, prospectingSets, 'var(--primary)', 'prospecting'),
                buildCampaign('🟡 Campaña 2: Re-Engagement (Tibio)', 0.20, warmSets, 'var(--warning)', 'warm'),
                buildCampaign('🔴 Campaña 3: Retargeting (Caliente)', 0.10, retargetingSets, 'var(--success)', 'retargeting')
            ]
        };

        setStructure(generatedStructure);
        setChatHistory([]); // Reset chat when generating new structure
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
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/refine-structure`, {
                message: chatInput,
                structureContext: {
                    inputs: formData,
                    outputs: structure
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

    return (
        <div className="campaign-structure">
            <h1>Estructura Estratégica de Campaña</h1>
            <p className="subtitle">Diseñamos la arquitectura perfecta según tus objetivos y presupuesto.</p>

            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: structure ? '1fr 1fr' : '1fr', maxWidth: structure ? '100%' : '600px' }}>

                {/* Form */}
                <div className="card">
                    <form onSubmit={generateStructure}>
                        <div className="form-group">
                            <label>Objetivo Principal</label>
                            <select className="form-control" name="objective" value={formData.objective} onChange={handleInputChange}>
                                <option value="mensajes">Conversaciones por Mensaje (WhatsApp/IG)</option>
                                <option value="leads">Captación de Leads (B2B o High Ticket)</option>
                                <option value="conversiones">Ventas Directas / E-commerce (Conversiones)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Moneda</label>
                                <select className="form-control" name="currency" value={formData.currency} onChange={handleInputChange}>
                                    <option value="USD">USD ($)</option>
                                    <option value="COP">COP ($)</option>
                                </select>
                            </div>
                            <div>
                                <label>Presupuesto Diario Estimado</label>
                                <input type="number" className="form-control" name="budget" value={formData.budget} onChange={handleInputChange} placeholder={formData.currency === 'COP' ? 'ej. 100000' : 'ej. 20'} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Estado del Pixel (Historial)</label>
                            <select className="form-control" name="knowledge" value={formData.knowledge} onChange={handleInputChange}>
                                <option value="principiante">Cuenta nueva / Sin Data Relevante</option>
                                <option value="avanzado">Cuenta madura (Más de 500 conversiones)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fase de la Campaña</label>
                            <select className="form-control" name="phase" value={formData.phase} onChange={handleInputChange}>
                                <option value="testeo">🧪 Fase de Testeo (Aislar y probar variables)</option>
                                <option value="escalado">🔥 Fase de Escalado (Exprimir ganadores con CBO)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                            Generar Estructura Estratégica
                        </button>
                    </form>
                </div>

                {/* Results Container */}
                {structure && (
                    <div className="results-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* View Switcher Tabs */}
                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setViewMode('map')}
                                style={{ background: 'transparent', border: 'none', padding: '0.8rem 1rem', color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: viewMode === 'map' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: viewMode === 'map' ? 'bold' : 'normal', fontSize: '1rem', whiteSpace: 'nowrap', transition: 'all 0.3s ease' }}
                            >
                                🗺️ Mapa Mental (Visual)
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('guided')}
                                style={{ background: 'transparent', border: 'none', padding: '0.8rem 1rem', color: viewMode === 'guided' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: viewMode === 'guided' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: viewMode === 'guided' ? 'bold' : 'normal', fontSize: '1rem', whiteSpace: 'nowrap', transition: 'all 0.3s ease' }}
                            >
                                📋 Modo Guiado (Paso a Paso)
                            </button>
                        </div>

                        <div className="card" style={{ margin: '0', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)', borderLeft: '4px solid var(--primary)' }}>
                            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Mapa Mental Algorítmico ✨</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>{structure.objectiveString}</p>
                            <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                Racional: {structure.rationale}
                            </p>
                        </div>

                        {viewMode === 'map' ? (
                            <>
                                {structure.campaigns.map((camp, cIdx) => (
                                    <div key={cIdx} style={{ background: 'var(--bg-secondary)', padding: '2rem 1rem', borderRadius: '0.8rem', border: `1px solid ${camp.color}` }}>
                                        {/* Campaign Node */}
                                        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                                            <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.4)', padding: '1rem 2rem', borderRadius: '0.5rem', border: `2px solid ${camp.color}`, position: 'relative', zIndex: 2 }}>
                                                <h3 style={{ margin: 0, color: camp.color, fontSize: '1.2rem' }}>{camp.title}</h3>
                                                <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold' }}>{camp.budgetSplit} · {camp.budgetVal}/día</p>
                                                {camp.isCBO && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}><br />(CBO: Presupuesto optimizado por IA)</span>}
                                            </div>
                                            {/* Connecting Line Down */}
                                            {camp.adsets.length > 0 && (
                                                <div style={{ position: 'absolute', top: '100%', left: '50%', width: '2px', height: '2.5rem', background: camp.color, transform: 'translateX(-50%)', zIndex: 1 }}></div>
                                            )}
                                        </div>

                                        {/* Ad Sets Nodes Row */}
                                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                                            {/* Top Horizontal Line across Ad Sets */}
                                            {camp.adsets.length > 1 && (
                                                <div style={{ position: 'absolute', top: '-2.5rem', left: '15%', right: '15%', height: '2px', background: camp.color }}></div>
                                            )}

                                            {camp.adsets.map((adset, aIdx) => (
                                                <div key={aIdx} style={{ flex: '1', minWidth: '220px', background: 'var(--bg-primary)', borderRadius: '0.5rem', padding: '1.5rem 1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                                    {/* Connecting Line Up from Ad Set */}
                                                    {camp.adsets.length > 1 && (
                                                        <div style={{ position: 'absolute', top: '-2.5rem', left: '50%', width: '2px', height: '2.5rem', background: camp.color, transform: 'translateX(-50%)' }}></div>
                                                    )}

                                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
                                                        <h4 style={{ margin: '0.5rem 0', fontSize: '1rem', color: 'white' }}>{adset.name}</h4>
                                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            {adset.budget}/día {camp.isCBO ? '(asignado por IA)' : '(CBO estimado)'}
                                                        </span>
                                                    </div>

                                                    {/* Ads Column List */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                                                        {adset.ads.map((ad, i) => (
                                                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                                <span style={{ color: 'var(--text-primary)' }}>📸 {ad.name}</span>
                                                                <span style={{ color: camp.color, fontWeight: 'bold' }}>{ad.budget}/día</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="guided-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--primary)' }}>
                                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                        💡 <strong>Instrucciones:</strong> Abre tu Administrador de Anuncios de Meta. Crea una nueva campaña y usa las opciones y nombres que dictan los siguientes pasos. Usa el botón "Copiar" para trasladar los nombres rápidamente, y marca con el check ☑️ las casillas a medida que avanzas.
                                    </p>
                                </div>

                                {structure.campaigns.map((camp, cIdx) => (
                                    <div key={`camp-${cIdx}`} className="card" style={{ borderLeft: `4px solid ${camp.color}`, background: 'var(--bg-secondary)', marginBottom: '0', padding: '1.5rem' }}>
                                        {/* Campaign Level */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: camp.color, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Nivel 1: Campaña</span>
                                                <h3 style={{ margin: '0.5rem 0', fontSize: '1.3rem', color: 'white' }}>{camp.title}</h3>
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    <span><strong>Presupuesto:</strong> {camp.budgetVal}/día {camp.isCBO ? '(Activado - CBO)' : '(Desactivado - ABO)'}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                <button type="button" onClick={() => copyToClipboard(camp.title)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid var(--primary)' }}>📋 Copiar</button>
                                                <input type="checkbox" checked={completedSteps[`camp-${cIdx}`] || false} onChange={() => toggleStep(`camp-${cIdx}`)} style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: camp.color }} />
                                            </div>
                                        </div>

                                        {/* Ad Sets Level */}
                                        <div style={{ paddingLeft: '1.5rem', borderLeft: `2px dashed ${camp.color}`, display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                                            {camp.adsets.map((adset, aIdx) => (
                                                <div key={`adset-${cIdx}-${aIdx}`} style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                        <div>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Nivel 2: Conjunto de Anuncios</span>
                                                            <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: 'white' }}>👥 {adset.name}</h4>
                                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Presupuesto: {adset.budget}/día {camp.isCBO ? '(Automático CBO)' : '(Fijado manualmente)'}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                            <button type="button" onClick={() => copyToClipboard(adset.name)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white' }}>📋 Copiar</button>
                                                            <input type="checkbox" checked={completedSteps[`adset-${cIdx}-${aIdx}`] || false} onChange={() => toggleStep(`adset-${cIdx}-${aIdx}`)} style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: camp.color }} />
                                                        </div>
                                                    </div>

                                                    {/* Ads Level */}
                                                    <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Nivel 3: Anuncios (Creativos)</span>
                                                        {adset.ads.map((ad, i) => (
                                                            <div key={`ad-${cIdx}-${aIdx}-${i}`} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                    <span style={{ fontSize: '1.2rem' }}>📸</span>
                                                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' }}>{ad.name}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                                                    <button type="button" onClick={() => copyToClipboard(ad.name)} className="btn" style={{ background: 'transparent', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>📋 Copiar</button>
                                                                    <input type="checkbox" checked={completedSteps[`ad-${cIdx}-${aIdx}-${i}`] || false} onChange={() => toggleStep(`ad-${cIdx}-${aIdx}-${i}`)} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: camp.color }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* AI Chat Module for Structure refinement */}
                        <div className="card ai-chat-module animate-fade-in" style={{ marginTop: '1rem', border: '1px solid var(--primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <div style={{ fontSize: '2.5rem' }}>🤖</div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.4rem' }}>Smarty (Tu Media Buyer Virtual)</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Pide explicaciones, alternativas, o consejos sobre esta estructura.</p>
                                </div>
                            </div>

                            <div className="chat-window" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                                {chatHistory.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                                        ¡Hola! Smarty aquí 🚀. Escribe abajo si quieres que te justifique por qué usé estos porcentajes, o si necesitas que ajuste la estrategia para tu caso específico 👇
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
                                        <span className="typing-indicator">Smarty está analizando...</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.8rem' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej. 'Mejor hagamos un CBO en la campaña 1'..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                    disabled={isChatting}
                                />
                                <button type="submit" className="btn" disabled={isChatting || !chatInput.trim()} style={{ padding: '0.8rem 2rem', fontWeight: 'bold' }}>
                                    Consultar a Smarty ✨
                                </button>
                            </form>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default CampaignStructure;
