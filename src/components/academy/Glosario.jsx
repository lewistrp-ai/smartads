import React, { useState } from 'react';

const termsData = [
    {
        id: "ctr",
        term: "CTR (Click Through Rate)",
        definition: "Es el porcentaje de personas que hacen clic después de ver tu anuncio.",
        formula: "Clics ÷ Impresiones x 100",
        example: "Si 1.000 personas ven tu anuncio y 30 hacen clic → CTR = 3%",
        good: "En frío: 1% – 2% | En caliente o retargeting: 3% – 6%",
        bad: "Menos del 0.8%. Significa que el anuncio no llama la atención (problema de creativo o gancho)."
    },
    {
        id: "cpm",
        term: "CPM (Costo por Mil Impresiones)",
        definition: "Es lo que te cobra Meta Ads cada vez que tu anuncio se muestra 1,000 veces en las pantallas de los usuarios.",
        formula: "Gasto ÷ Impresiones x 1000",
        example: "Si gastas $10 USD y logras 2,000 impresiones → CPM = $5 USD",
        good: "Depende del nicho, pero un CPM estable indica que a Facebook le gusta tu anuncio y la competencia no está saturada.",
        bad: "Un pico abrupto en el CPM indica fatiga del anuncio, mucha competencia o que tu público es demasiado restrictivo."
    },
    {
        id: "cpc",
        term: "CPC (Costo por Clic)",
        definition: "Es cuánto pagas en promedio por cada clic en el enlace de tu anuncio.",
        formula: "Gasto Total ÷ Número de Clics",
        example: "Si gastas $20 USD y consigues 100 clics → CPC = $0.20 USD",
        good: "Mientras más bajo, mejor. Significa que estás llevando tráfico barato a tu web.",
        bad: "Un CPC alto con un CTR normal indica que estás pagando mucho por la impresión (CPM alto). Si de paso el CTR es bajo, la segmentación es mala."
    },
    {
        id: "cpa",
        term: "CPA (Costo por Adquisición/Acción)",
        definition: "Es el costo promedio para conseguir que un usuario realice la acción que deseas (compra, registro, lead). Es la Métrica Reina.",
        formula: "Gasto Total ÷ Número de Conversiones",
        example: "Gastas $100 USD y consigues 5 ventas → CPA = $20 USD",
        good: "Cuando el CPA es menor a la ganancia (Margen) que te deja el producto. Si el producto te deja $50 de ganancia y el CPA es $20, excelente.",
        bad: "Cuando el CPA es mayor que tu margen de ganancia. Significa que estás perdiendo dinero por cada venta."
    },
    {
        id: "roas",
        term: "ROAS (Return on Ad Spend)",
        definition: "Es el retorno de inversión publicitaria. Mide cuántos dólares genera en ingresos cada dólar que inviertes en anuncios.",
        formula: "Ingresos Totales por Ads ÷ Gasto en Ads",
        example: "Gastas $1,000 USD y generas $4,000 USD en ventas → ROAS = 4 (O 400%)",
        good: "Mayor al ROAS de punto de equilibrio (Break-even ROAS). Generalmente un ROAS > 2 o 3 es saludable para E-commerce.",
        bad: "ROAS cercano a 1 o menor. Estás perdiendo dinero o cambiando plata por plata."
    },
    {
        id: "roi",
        term: "ROI (Return on Investment)",
        definition: "A diferencia del ROAS, el ROI calcula la rentabilidad total de la empresa o campaña incluyendo TODOS los costos (producto, software, equipo), no solo el gasto en Ads.",
        formula: "(Ganancia Neta ÷ Inversión Total) x 100",
        example: "Inversión total $500. Ganancia neta final de todo $1,500 → ROI = 200%",
        good: "Mayor a 0%. Simplemente significa que el negocio entero es rentable.",
        bad: "Menor a 0%. El costo de operar e invertir es mayor que lo que ingresa."
    },
    {
        id: "alcance",
        term: "Alcance",
        definition: "El número total de personas ÚNICAS que vieron tu anuncio al menos una vez.",
        formula: "Métrica directa de Meta.",
        example: "Si tu alcance es 5,000, significa que 5,000 individuos distintos fueron impactados.",
        good: "Fundamental para escalar. Si el alcance se estanca, la campaña deja de crecer.",
        bad: "Si el presupuesto sube pero el alcance no, estás impactando a las mismas personas (aumenta tu frecuencia)."
    },
    {
        id: "frecuencia",
        term: "Frecuencia",
        definition: "El número promedio de veces que cada persona ha visto tu anuncio.",
        formula: "Impresiones ÷ Alcance",
        example: "10,000 Impresiones y 5,000 de Alcance → Frecuencia = 2.0",
        good: "Para campañas de remarketing, una frecuencia de 3 a 5 es normal porque buscas insistencia.",
        bad: "Para público frío (gente nueva), una frecuencia mayor a 2.5-3 significa saturación (Fatiga del anuncio). ¡Es hora de cambiar creativos!"
    },
    {
        id: "cbo",
        term: "CBO (Advantage+ Campaign Budget)",
        definition: "El presupuesto se configura a nivel de CAMPAÑA y el algoritmo de Meta decide automáticamente en qué Conjunto de Anuncios gastarlo para buscar el costo más barato.",
        formula: "N/A - Configuración",
        example: "Pones $50 en CBO con 3 públicos. Meta quizás gaste $40 en el Público 1 porque ve que ahí están las ventas, y $5 en el resto.",
        good: "Útil para escalar y darle libertad al algoritmo una vez que tienes cuentas sazonadas con un píxel alimentado.",
        bad: "Si pones públicos de tamaños muy distintos, Meta gastará todo en el más grande ignorando a los demás."
    },
    {
        id: "abo",
        term: "ABO (Ad Set Budget Optimization)",
        definition: "El presupuesto se controla manualmente a nivel de CONJUNTO DE ANUNCIOS.",
        formula: "N/A - Configuración",
        example: "Tienes 3 públicos y a cada uno le asignas exactamente $10 USD diarios.",
        good: "Ideal para la Etapa de Testeo. Obligas a Meta a gastar equitativamente para descubrir qué público o anuncio funciona de forma justa.",
        bad: "Requiere más micro-gestión diaria tuya para apagar o encender presupuestos."
    },
    {
        id: "pixel",
        term: "Píxel de Meta",
        definition: "Un fragmento de código que instalas en tu página web. Sirve para rastrear el comportamiento del usuario (clics, visitas, compras) y devolverle la información a Meta Ads para optimizar tu publicidad.",
        formula: "N/A - Herramienta tecnológica",
        example: "Si 10 personas compran en tu web, el Píxel lo detecta, 'aprende' cómo son esas 10 personas, y busca clones de ellos en Facebook.",
        good: "Vital. Sin Pixel no hay medición de conversiones correcta ni optimización real.",
        bad: "Un Píxel mal configurado lanzará 'eventos repetidos' o información falsa al algoritmo."
    },
    {
        id: "capi",
        term: "Conversion API (CAPI)",
        definition: "El hermano mayor del Píxel. En vez de rastrear información en el navegador (que a veces lo bloquea), CAPI envía la data directamente desde el servidor de tu web a los servidores de Meta.",
        formula: "N/A - Herramienta tecnológica",
        example: "Si un usuario usa iOS14 v usa un bloqueador de anuncios y el Píxel no lo atrapa comprando, CAPI sí lo enviará.",
        good: "Obligatorio hoy en día para recuperar hasta un 30% de data perdida por bloqueos como los de Apple.",
        bad: "No usarlo te hace perder optimización."
    },
    {
        id: "lookalike",
        term: "Público Similar (Lookalike)",
        definition: "Le das a Meta una lista de personas (ej. tus compradores o seguidores) y le pides que encuentre al 1%, 5% o 10% de la población de un país entero que MÁS se parezca a ellos.",
        formula: "N/A - Tipo de segmentación",
        example: "Dame el 1% de personas parecidas a los que compraron mi producto el mes pasado.",
        good: "Una de las mejores formas de segmentar porque el algoritmo busca similitudes de comportamiento y gustos mejor que tú a mano.",
        bad: "Si tu lista base o 'semilla' es de mala calidad (ej. seguidores falsos o leads basura), el Público Similar que crees también será basura."
    },
    {
        id: "custom_audience",
        term: "Público Personalizado (Custom Audience)",
        definition: "Un público compuesto por personas que ya han interactuado contigo (Remárketing).",
        formula: "N/A - Tipo de segmentación",
        example: "Personas que vieron el 50% de mi video, o que enviaron un mensaje por Instagram en los últimos 30 días.",
        good: "El público más 'caliente' posible. Aquí suelen venir las compras más baratas por retargeting.",
        bad: "Si el público inicial es muy muy pequeño, no gastará presupuesto."
    },
    {
        id: "advantage_plus",
        term: "Advantage+",
        definition: "La inteligencia artificial y automatización extrema de Meta. Literalmente les cedes el control del presupuesto, públicos y a veces creativos a cambio de mejor performance.",
        formula: "N/A - Tipo de Campaña / Configuración",
        example: "Campañas de Compras Advantage+. No te deja escoger ciudades específicas ni edades detalladas, él busca al comprador automáticamente.",
        good: "Suele bajar el CPA en E-commerce considerablemente porque la IA de Meta es muy lista hoy.",
        bad: "Tienes poco control si el algoritmo se 'vuelve loco' o si estás empezando con un negocio y píxel totalmente nuevos."
    }
];

const Glosario = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    const filteredTerms = termsData.filter((t) =>
        t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="glosario-container" style={{ position: 'relative' }}>
            <div className="search-bar-container" style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Busca un término (ej. CTR, Pixel, CPA...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '0.5rem' }}
                />
            </div>

            <div className="terms-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTerms.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron términos para "{searchTerm}"</p>
                ) : (
                    filteredTerms.map((t) => (
                        <div
                            key={t.id}
                            className={`term-card card ${expandedId === t.id ? 'expanded' : ''}`}
                            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease', borderLeft: expandedId === t.id ? '4px solid var(--primary)' : '1px solid var(--border-color)' }}
                            onClick={() => toggleExpand(t.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: expandedId === t.id ? 'var(--primary)' : 'white' }}>📌 {t.term}</h3>
                                <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
                                    {expandedId === t.id ? '−' : '+'}
                                </span>
                            </div>

                            {expandedId === t.id && (
                                <div className="term-details animate-fade-in" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>¿Qué es?</h4>
                                        <p style={{ margin: 0 }}>{t.definition}</p>
                                    </div>

                                    {t.formula && t.formula !== "N/A - Configuración" && t.formula !== "N/A - Herramienta tecnológica" && t.formula !== "N/A - Tipo de segmentación" && t.formula !== "N/A - Tipo de Campaña / Configuración" && t.formula !== "Métrica directa de Meta." && (
                                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Fórmula</h4>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>{t.formula}</p>
                                        </div>
                                    )}

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ejemplo Práctico</h4>
                                        <p style={{ margin: 0, fontStyle: 'italic' }}>{t.example}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--success)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Cuándo es BUENO ✔</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.good}</p>
                                        </div>
                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--warning)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--warning)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Cuándo PREOCUPARSE ⚠</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.bad}</p>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Glosario;
