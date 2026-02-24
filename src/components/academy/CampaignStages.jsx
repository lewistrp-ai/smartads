import React, { useState } from 'react';

const stagesData = [
    {
        id: "test",
        title: "Fase 1: Testeo 🔵",
        objective: "Encontrar ganadores (Creativos o Públicos rentables).",
        rules: [
            "Presupuesto bajo (ej. $5 - $10 USD diarios por conjunto).",
            "Usa campaña ABO (control manual de presupuesto).",
            "Prueba 2 a 3 públicos distintos.",
            "Dentro de cada público, prueba 3 creativos (ideal: 2 videos, 1 imagen)."
        ],
        duration: "Déjalo correr mínimo 3 a 5 días sin tocar nada.",
        action: "Identifica qué anuncio trae el Costo por Compra (CPA) más barato."
    },
    {
        id: "optimize",
        title: "Fase 2: Optimización 🟡",
        objective: "Cortar las pérdidas y enfocar el presupuesto en lo que funciona.",
        rules: [
            "Regla de Oro: Si algo te cuesta más que tu margen de ganancia, APÁGALO.",
            "Pausa todos los anuncios con CTR menor a 1%.",
            "Pausa los conjuntos de anuncios que hayan gastado 2 veces tu CPA ideal y no tengan ventas.",
            "Duplica el anuncio ganador dentro del mismo conjunto para darle más fuerza (opcional)."
        ],
        duration: "Revisar cada 48 horas.",
        action: "Quedarte solo con los 'Anuncios Ganadores' activos."
    },
    {
        id: "scale",
        title: "Fase 3: Escalado 🔴",
        objective: "Aumentar el presupuesto agresivamente manteniendo o mejorando el CPA.",
        rules: [
            "Escalado Vertical: Sube el presupuesto del conjunto ganador un 20% cada 2 días.",
            "Escalado Horizontal: Duplica el anuncio ganador pero ponlo a competir en públicos totalmente nuevos (o públicos similares/lookalikes del 1% al 5%).",
            "Cambia la campaña a CBO (Automática) y pon todos tus conjuntos ganadores allí con presupuesto alto."
        ],
        duration: "Mientras el CPA se mantenga rentable.",
        action: "Monitorear de cerca. Al meter más dinero, el costo siempre sube un poco."
    },
    {
        id: "maintain",
        title: "Fase 4: Mantenimiento 🟢",
        objective: "Evitar la fatiga del anuncio y mantener las ventas estables a largo plazo.",
        rules: [
            "Lanza 'Mini campañitas' de testeo en paralelo a tu campaña principal ganadora.",
            "Cada 2 o 3 semanas, inyecta creativos (videos) nuevos a tu campaña principal.",
            "Empieza a hacer Retargeting: Muestra testimonios u ofertas a la gente que vio tu campaña ganadora pero no compró."
        ],
        duration: "Infinita (hasta que el producto muera).",
        action: "Prevenir que tu campaña ganadora muera por aburrimiento."
    }
];

const CampaignStages = () => {
    const [selectedStage, setSelectedStage] = useState('test');

    return (
        <div className="stages-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Las 4 Fases de una Campaña Exitosa</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Nunca trates de escalar en el día 1, ni de optimizar al mes. Sigue este orden religioso para proteger tu presupuesto.
            </p>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
                {stagesData.map((stage, idx) => {
                    const isActive = selectedStage === stage.id;
                    return (
                        <button
                            key={stage.id}
                            style={{
                                padding: '1rem 1.5rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                fontWeight: isActive ? 'bold' : 'normal'
                            }}
                            onClick={() => setSelectedStage(stage.id)}
                        >
                            {stage.title.split(':')[0]} {/* Show just 'Fase X' or 'Testeo' based on split */}
                        </button>
                    );
                })}
            </div>

            {/* Active Stage Content */}
            <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                {stagesData.filter(s => s.id === selectedStage).map(stage => (
                    <div key={stage.id}>
                        <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '1rem' }}>{stage.title}</h3>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--text-secondary)' }}>
                            <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>El Objetivo Principal</strong>
                            <span>{stage.objective}</span>
                        </div>

                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📋</span> Checklist de Reglas
                        </h4>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stage.rules.map((rule, i) => (
                                <li key={i} style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--success)' }}>✔</span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid var(--warning)' }}>
                                <strong style={{ display: 'block', color: 'var(--warning)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duración</strong>
                                <span style={{ fontSize: '0.9rem' }}>{stage.duration}</span>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid var(--success)' }}>
                                <strong style={{ display: 'block', color: 'var(--success)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Acción de Salida</strong>
                                <span style={{ fontSize: '0.9rem' }}>{stage.action}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CampaignStages;
