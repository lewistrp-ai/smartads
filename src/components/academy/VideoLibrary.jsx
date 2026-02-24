import React, { useState } from 'react';

const VideoLibrary = () => {
    // Mock data for YouTube videos based on the user's requirements
    const [videos] = useState([
        {
            id: 'video-1',
            title: 'La plantilla de Notion que uso para organizar mis tareas (Gratis) 🚀',
            description: 'Organiza tu flujo de trabajo de marketing con esta plantilla gratuita de Notion.',
            youtubeId: 'y00FKlV-1wk',
            category: 'Optimización',
            recommended: false
        },
        {
            id: 'video-2',
            title: 'Chat GPT Atlas I NO VAS A CREER lo que puede hacer este navegador 😳🔥',
            description: 'Potencia tu productividad publicitaria con las funciones inteligentes de Chat GPT Atlas.',
            youtubeId: 'iArVF3QUCqs',
            category: 'Optimización',
            recommended: false
        },
        {
            id: 'video-3',
            title: 'Con estos 8 pasos vas a entender Meta Andromeda mejor que muchos expertos 🚀',
            description: 'Aprende los pilares fundamentales para dominar el ecosistema publicitario de Meta.',
            youtubeId: 'XADUS-8wCto',
            category: 'Fundamentos',
            recommended: true
        },
        {
            id: 'video-5',
            title: 'Cómo convertir tu WhatsApp en una máquina de ventas usando ManyChat | Tutorial desde cero 😴💰',
            description: 'Estrategia paso a paso para automatizar respuestas y cerrar ventas masivas por WhatsApp.',
            youtubeId: 'y0qVNol9kik',
            category: 'Estrategia',
            recommended: true
        },
        {
            id: 'video-6',
            title: 'Crece en Instragram sin ser influencer: usa esta estrategia con Meta Ads 🚀',
            description: 'Metodología estratégica para escalar seguidores en Instagram mediante pauta pagada.',
            youtubeId: 'ecM2ot1tVe4',
            category: 'Estrategia',
            recommended: false
        },
        // Playlist Videos
        {
            id: 'playlist-1',
            title: 'Introducción - El curso GRATIS donde aprenderás a crear campañas en Facebook ads desde cero',
            description: 'Bienvenida y descripción general del curso gratuito de Meta Ads para 2024.',
            youtubeId: '3jGNJFQMO7I',
            category: 'Fundamentos',
            recommended: true
        },
        {
            id: 'playlist-2',
            title: '💵 ¿Qué es un Funnel o embudo de ventas?',
            description: 'Explicación clara sobre qué es un embudo de ventas y su importancia en marketing.',
            youtubeId: 'rlcXxfPxd2o',
            category: 'Fundamentos',
            recommended: true
        },
        {
            id: 'playlist-3',
            title: '🎯 ¿Cómo elegir la mejor segmentación para tus campañas de facebook ads?',
            description: 'Guía para seleccionar el público objetivo ideal y mejorar la segmentación en tus anuncios.',
            youtubeId: 'KoYfkZr7oBs',
            category: 'Estrategia',
            recommended: false
        },
        {
            id: 'playlist-4',
            title: '¿Qué son los eventos en Facebook Ads?',
            description: 'Conceptos básicos sobre el seguimiento de eventos y acciones de los usuarios en Meta.',
            youtubeId: 'xPUiLgZLT3E',
            category: 'Fundamentos',
            recommended: false
        },
        {
            id: 'playlist-5',
            title: '👉🏻 Creación de públicos personalizados y similares en Business Manager Paso a Paso',
            description: 'Tutorial paso a paso para crear públicos personalizados y lookalike en el Administrador Comercial.',
            youtubeId: 'KgDjvHE8JaQ',
            category: 'Estrategia',
            recommended: false
        },
        {
            id: 'playlist-6',
            title: '⚙️ Configuración del negocio en Facebook Ads paso a paso',
            description: 'Configuración inicial completa del Business Manager para empezar a pautar.',
            youtubeId: '-KYu5n2YYFE',
            category: 'Fundamentos',
            recommended: true
        },
        {
            id: 'playlist-7',
            title: '🤔 ¿Pautar desde el botón de promocionar o desde el administrador de anuncios?',
            description: 'Comparativa entre el botón de promocionar y el uso profesional del administrador de anuncios.',
            youtubeId: 'amdVFG3C9HM',
            category: 'Fundamentos',
            recommended: false
        },
        {
            id: 'playlist-8',
            title: '🔥 La mejor campaña para crecer en Instagram desde el Administrador de anuncios de Facebook 🔥',
            description: 'Estrategia avanzada para ganar seguidores y visibilidad en Instagram eficazmente.',
            youtubeId: 'EMrgp3cOqQg',
            category: 'Estrategia',
            recommended: true
        },
        {
            id: 'playlist-9',
            title: '💸 Consigue clientes por whatsapp con esta campaña en facebook ads',
            description: 'Cómo configurar campañas directas a WhatsApp para captar leads y cerrar ventas.',
            youtubeId: 'tJhnp1QBAkw',
            category: 'Estrategia',
            recommended: true
        },
        {
            id: 'playlist-10',
            title: '💸 Cómo crear una campaña de ventas en Facebook Ads',
            description: 'Paso a paso para estructurar una campaña enfocada en conversiones y ventas directas.',
            youtubeId: 'a22L9uF0zCY',
            category: 'Estrategia',
            recommended: true
        },
        {
            id: 'playlist-11',
            title: '🕵🏽 Las métricas que si o si deberías ver en tus campañas de Meta Ads',
            description: 'Análisis de los indicadores clave de rendimiento (KPIs) para medir el éxito de tus anuncios.',
            youtubeId: 'UD3Dw0zmar8',
            category: 'Optimización',
            recommended: true
        },
        {
            id: 'playlist-12',
            title: '¿Por qué Facebook gasta más de tu presupuesto? 🤯',
            description: 'Explicación del sistema de subastas y gasto dinámico de presupuesto en Facebook.',
            youtubeId: 'Jdb2pXXaGOc',
            category: 'Optimización',
            recommended: false
        }
    ]);

    const [activeCategory, setActiveCategory] = useState('Todas');

    const categories = ['Todas', ...new Set(videos.map(v => v.category))];

    const filteredVideos = activeCategory === 'Todas'
        ? videos
        : videos.filter(v => v.category === activeCategory);

    // Prioritize recommended videos
    const sortedVideos = [...filteredVideos].sort((a, b) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return 0;
    });

    return (
        <div className="video-library-container animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>📺 Biblioteca de Videos</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Las mejores masterclasses de mi canal de YouTube organizadas para ti.</p>
                </div>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="btn"
                        style={{
                            background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            border: activeCategory === cat ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                            color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                            borderRadius: '2rem',
                            padding: '0.4rem 1.2rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {sortedVideos.map(video => (
                    <div key={video.id} className="card hover-scale" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* YouTube Embed Container (16:9 Aspect Ratio) */}
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Video Info */}
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                    {video.category}
                                </span>
                                {video.recommended && (
                                    <span style={{ fontSize: '0.7rem', background: 'var(--warning)', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 'bold' }}>
                                        ⭐ Recomendado
                                    </span>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: 'white', lineHeight: '1.4' }}>{video.title}</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', flex: 1 }}>{video.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {sortedVideos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No hay videos en esta categoría.</p>
                </div>
            )}
        </div>
    );
};

export default VideoLibrary;
