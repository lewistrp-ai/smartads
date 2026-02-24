import React, { useState } from 'react';

const CampaignStructureDiagram = () => {
    const [simplifiedMode, setSimplifiedMode] = useState(false);

    const normalContent = {
        title: "Estructura de Campaña",
        description: "Entiende cómo se organizan tus anuncios en Meta Ads. La estructura correcta es vital para que el algoritmo pueda optimizar tu presupuesto.",
        nodes: [
            {
                type: "Campaña",
                icon: "🎯",
                title: "Nivel 1: La Campaña",
                subtitle: "¿Qué quieres lograr?",
                details: "Aquí defines tu Objetivo Publicitario central (Ventas, Clientes Potenciales, Tráfico, Interacción). Todo lo que esté dentro de esta campaña perseguirá exclusivamente este objetivo.",
                color: "var(--primary)",
                bg: "rgba(59, 130, 246, 0.1)"
            },
            {
                type: "Conjunto",
                icon: "👥",
                title: "Nivel 2: Conjunto de Anuncios",
                subtitle: "¿A quién, dónde y cuándo?",
                details: "Aquí configuras a tu Audiencia (Edades, Intereses, Públicos Similares), las Ubicaciones (Instagram, Facebook, Stories) y el Calendario. Puedes tener varios conjuntos dentro de una campaña para probar qué público funciona mejor.",
                color: "var(--warning)",
                bg: "rgba(245, 158, 11, 0.1)"
            },
            {
                type: "Anuncio",
                icon: "📱",
                title: "Nivel 3: El Anuncio",
                subtitle: "¿Qué van a ver?",
                details: "Es la parte visible: El video, la imagen, el texto (copy) y el botón (Llamado a la acción). Esto es lo que engancha al usuario. Debes tener varios anuncios por conjunto para ver cuál atrae más clics.",
                color: "var(--success)",
                bg: "rgba(16, 185, 129, 0.1)"
            }
        ]
    };

    const simpleContent = {
        title: "Estructura de Campaña (Explicada Fácil)",
        description: "Imagina que Meta Ads es como organizar una gran fiesta. Aquí te explicamos cómo se hace paso a paso.",
        nodes: [
            {
                type: "Campaña",
                icon: "🎉",
                title: "La Fiesta (Campaña)",
                subtitle: "El propósito del evento",
                details: "¿Para qué es la fiesta? ¿Es para vender pasteles o para que la gente solo vaya a bailar? Aquí le dices a Facebook: 'Oye, quiero organizar una fiesta exclusivamente para que la gente me compre zapatos'.",
                color: "var(--primary)",
                bg: "rgba(59, 130, 246, 0.1)"
            },
            {
                type: "Conjunto",
                icon: "🎫",
                title: "Las Invitaciones (Conjunto)",
                subtitle: "A quién dejas entrar",
                details: "Aquí decides a quién invitar. 'Solo quiero hombres de 25 años a los que les guste el fútbol que vivan en Bogotá'. También decides a qué hora entregar las invitaciones.",
                color: "var(--warning)",
                bg: "rgba(245, 158, 11, 0.1)"
            },
            {
                type: "Anuncio",
                icon: "🍿",
                title: "La Tarjeta Visual (Anuncio)",
                subtitle: "Lo que ven tus invitados",
                details: "Esta es la cartulina bonita que le pasas a las personas para convencerlas de ir a la fiesta. Tiene una foto increíble, un texto persuasivo y un botón grande que dice 'Asistir'.",
                color: "var(--success)",
                bg: "rgba(16, 185, 129, 0.1)"
            }
        ]
    };

    const currentContent = simplifiedMode ? simpleContent : normalContent;

    return (
        <div className="structure-diagram-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: simplifiedMode ? 'var(--warning)' : 'white', transition: 'color 0.3s' }}>
                        {currentContent.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{currentContent.description}</p>
                </div>

                <button
                    className={`btn ${simplifiedMode ? 'btn-secondary' : ''}`}
                    style={{
                        background: simplifiedMode ? 'rgba(245, 158, 11, 0.2)' : '',
                        borderColor: simplifiedMode ? 'var(--warning)' : '',
                        color: simplifiedMode ? 'var(--warning)' : '',
                        whiteSpace: 'nowrap',
                        marginLeft: '1rem'
                    }}
                    onClick={() => setSimplifiedMode(!simplifiedMode)}
                >
                    {simplifiedMode ? '🤓 Volver a Modo Técnico' : '👶 Explícamelo como si tuviera 10 años'}
                </button>
            </div>

            <div className="hierarchy-tree" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem', paddingLeft: '2rem' }}>
                {/* Vertical Line Connector */}
                <div style={{
                    position: 'absolute',
                    left: '4.5rem',
                    top: '2rem',
                    bottom: '2rem',
                    width: '4px',
                    background: 'var(--border-color)',
                    zIndex: 0,
                    borderRadius: '2px'
                }}></div>

                {currentContent.nodes.map((node, idx) => (
                    <div key={idx} className="hierarchy-node card" style={{
                        display: 'flex',
                        gap: '2rem',
                        position: 'relative',
                        zIndex: 1,
                        borderLeft: `4px solid ${node.color}`,
                        transition: 'all 0.3s ease'
                    }}>

                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            background: node.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            border: `2px solid ${node.color}`,
                            flexShrink: 0
                        }}>
                            {node.icon}
                        </div>

                        <div>
                            <span style={{
                                display: 'inline-block',
                                color: node.color,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                marginBottom: '0.25rem'
                            }}>
                                {node.type}
                            </span>
                            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>{node.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontStyle: 'italic', margin: '0 0 1rem 0' }}>{node.subtitle}</p>
                            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1.05rem' }}>{node.details}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card mt-6" style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Regla de Oro:</strong> Nunca cambies el objetivo de una campaña si ya está funcionando. Si quieres probar otro objetivo, crea una campaña nueva.
                </p>
            </div>
        </div>
    );
};

export default CampaignStructureDiagram;
