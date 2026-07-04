import React from 'react';
import { OFFER_LADDER, formatCOP, openCheckout } from '../config/ladder';

// "Mi Escalera de Crecimiento" — muestra el ecosistema completo de ofertas,
// de la entrada al high ticket. Es la pantalla de upsell que aparece cuando un
// alumno termina un nivel ("solo para asistentes de hoy") y también un mapa
// permanente de por dónde puede seguir creciendo con Smart Ads.
const GrowthLadder = () => {
    const handleCheckout = (offer) => {
        // Abre el checkout de Hotmart si ya está configurado su link.
        if (!openCheckout(offer)) {
            // Aún sin link de Hotmart: avisamos en vez de dejar el botón "muerto".
            alert(`Pronto podrás comprar "${offer.name}" aquí. Escríbenos por WhatsApp para reservar tu cupo.`);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>Tu Escalera de Crecimiento</h1>
                <p className="subtitle" style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
                    No vendemos un taller: te acompañamos en un ecosistema donde cada paso te lleva más lejos.
                    Avanza a tu ritmo, un peldaño a la vez.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {OFFER_LADDER.map((offer, idx) => (
                    <div
                        key={offer.id}
                        className="card hover-scale"
                        style={{
                            margin: 0, display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem',
                            border: offer.highlight ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                            background: offer.highlight ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                        }}
                    >
                        {/* Número de peldaño */}
                        <div style={{
                            flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', color: 'var(--text-secondary)',
                        }}>
                            {idx + 1}
                        </div>

                        <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{offer.icon}</div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{offer.name}</h3>
                                {offer.recurring && (
                                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Recurrente</span>
                                )}
                                {offer.highlight && !offer.recurring && (
                                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Recomendado</span>
                                )}
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{offer.subtitle}</p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {formatCOP(offer.priceCOP)}
                                {offer.recurring && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mes</span>}
                            </p>
                            <button
                                className="btn"
                                onClick={() => handleCheckout(offer)}
                                style={{
                                    marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem',
                                    background: offer.highlight ? 'var(--accent-color)' : 'transparent',
                                    color: offer.highlight ? 'black' : 'var(--accent-color)',
                                    border: offer.highlight ? 'none' : '1px solid var(--accent-color)',
                                    fontWeight: 'bold',
                                }}
                            >
                                {offer.cta}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ¿Dudas sobre cuál es tu siguiente paso? El Vendedor IA puede recomendarte según dónde estás hoy.
            </p>
        </div>
    );
};

export default GrowthLadder;
