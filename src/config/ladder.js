// =============================================================================
// Smart Ads · Escalera de Valor (Growth Ladder)
// -----------------------------------------------------------------------------
// Única fuente de verdad del ecosistema de ofertas. La reutilizan:
//   - La Academy (para bloquear/desbloquear niveles de formación)
//   - La página "Mi Escalera de Crecimiento" (ofertas / upsells)
//   - (Próximamente) el Vendedor IA y el Dashboard de negocio
//
// La idea estratégica: cada peldaño conduce naturalmente al siguiente
// (entrada -> recurrente -> high ticket), para capturar más valor de cada
// alumno sin depender de conseguir siempre clientes nuevos.
// =============================================================================

// -----------------------------------------------------------------------------
// Niveles de formación de la Academy (la "escuela de Meta Ads" por niveles).
// El contenido del Nivel 1 ya existe en la app; los Niveles 2 y 3 se muestran
// bloqueados con su temario y una llamada a comprar la siguiente oferta.
// -----------------------------------------------------------------------------
export const ACADEMY_LEVELS = [
    {
        id: 1,
        name: 'Nivel 1 · Fundamentos de Meta Ads',
        tagline: 'Crea tu primera campaña rentable desde cero.',
        priceCOP: 156000, // ~USD 39 (oferta de entrada)
        color: 'var(--accent-color)',
        offerId: 'taller', // enlaza con OFFER_LADDER (allí se pega el link de Hotmart)
        topics: [
            'Business Manager y píxel',
            'Segmentación y públicos',
            'Creativos que venden',
            'Métricas clave: CPM, CTR, CPA, ROAS',
            'Optimización básica',
        ],
    },
    {
        id: 2,
        name: 'Nivel 2 · Optimización y Escalamiento',
        tagline: 'Escala campañas ganadoras sin quemar presupuesto.',
        priceCOP: 388000, // ~USD 97
        color: 'var(--warning)',
        offerId: 'nivel2', // enlaza con OFFER_LADDER (allí se pega el link de Hotmart)
        topics: [
            'Escalamiento horizontal y vertical',
            'Testing avanzado (A/B)',
            'Embudos y remarketing',
            'Públicos avanzados y look-alikes',
            'Conversion API (CAPI)',
            'E-commerce y Lead Scoring',
        ],
    },
    {
        id: 3,
        name: 'Nivel 3 · Automatización + IA',
        tagline: 'Convierte tu operación en un sistema automático.',
        priceCOP: 588000,
        color: 'var(--success)',
        offerId: 'nivel3', // enlaza con OFFER_LADDER (allí se pega el link de Hotmart)
        topics: [
            'Automatizaciones de campañas',
            'IA aplicada a creativos y copy',
            'WhatsApp + CRM',
            'ManyChat avanzado',
            'Casos reales de cuentas',
        ],
    },
];

// -----------------------------------------------------------------------------
// ¿A qué niveles de la Academy puede acceder este usuario HOY?
//
// TODO(Fase 2 · Hotmart): hoy el acceso se deriva del rol/plan asignado a mano.
// Cuando se integre Hotmart, su webhook guardará los productos comprados en el
// perfil de Supabase y bastará con cambiar ESTA función (un solo lugar) para
// leer esos productos en vez del rol.
// -----------------------------------------------------------------------------
export function getUnlockedLevels(role, plan) {
    // Admin y miembros Smart Ads (pro/agency) acceden a todo.
    if (role === 'admin' || plan === 'pro' || plan === 'agency') {
        return [1, 2, 3];
    }
    // Asistentes al taller entran por el Nivel 1.
    if (role === 'workshop' || role === 'client') {
        return [1];
    }
    return [1];
}

// -----------------------------------------------------------------------------
// Escalera completa del ecosistema (lo que se muestra en la página de ofertas).
// Ordenada de entrada a high ticket. `recurring` marca la membresía.
//
// 👉 AQUÍ SE CONECTAN LOS PAGOS: pega el link de checkout de Hotmart de cada
//    producto en su `checkoutUrl`. Es el ÚNICO lugar que debes editar; los
//    botones de la escalera, de la Academy y de la oferta final lo usan todos.
//    (Mientras esté vacío, el botón lleva a la página de ofertas como respaldo.)
// -----------------------------------------------------------------------------
export const OFFER_LADDER = [
    {
        id: 'taller',
        icon: '🎯',
        name: 'Taller de Meta Ads',
        subtitle: 'La puerta de entrada. Presencial o virtual.',
        priceCOP: 300000,
        recurring: false,
        cta: 'Reservar cupo',
        checkoutUrl: '',
        highlight: false,
    },
    {
        id: 'grabaciones',
        icon: '📚',
        name: 'Grabaciones + recursos de por vida',
        subtitle: 'Repite el taller cuando quieras, para siempre.',
        priceCOP: 120000,
        recurring: false,
        cta: 'Obtener acceso',
        checkoutUrl: '',
        highlight: false,
    },
    {
        id: 'nivel2',
        icon: '🚀',
        name: 'Nivel 2 · Optimización y Escalamiento',
        subtitle: 'Solo para quienes ya dominan los fundamentos.',
        priceCOP: 388000,
        recurring: false,
        cta: 'Subir de nivel',
        checkoutUrl: '',
        highlight: false,
    },
    {
        id: 'laboratorio',
        icon: '🧪',
        name: 'Laboratorio de campañas en vivo',
        subtitle: 'Implementa campañas reales conmigo, en directo.',
        priceCOP: 300000,
        recurring: false,
        cta: 'Entrar al laboratorio',
        checkoutUrl: '',
        highlight: false,
    },
    {
        id: 'smartads',
        icon: '👥',
        name: 'Membresía Smart Ads',
        subtitle: 'Acompañamiento, herramientas de IA y comunidad. Cada mes.',
        priceCOP: 49000,
        recurring: true,
        cta: 'Unirme a la membresía',
        checkoutUrl: '',
        highlight: true, // el corazón recurrente del negocio
    },
    {
        id: 'nivel3',
        icon: '🤖',
        name: 'Nivel 3 · Automatización + IA',
        subtitle: 'Automatiza tu operación con IA, WhatsApp y CRM.',
        priceCOP: 588000,
        recurring: false,
        cta: 'Automatizar mi negocio',
        checkoutUrl: '',
        highlight: false,
    },
    {
        id: 'mentoria',
        icon: '💎',
        name: 'Mentoría · Implementación personalizada',
        subtitle: 'Trabajo 1 a 1 sobre tu cuenta. Cupos limitados.',
        priceCOP: 900000,
        recurring: false,
        cta: 'Postular a la mentoría',
        checkoutUrl: '',
        highlight: false,
    },
];

// Ofertas que se muestran en el "momento de oro" (al completar el Nivel 1):
// la membresía recurrente (el corazón del negocio) y el siguiente nivel.
export const NEXT_STEP_OFFER_IDS = ['smartads', 'nivel2'];

// -----------------------------------------------------------------------------
// Utilidad: formatear pesos colombianos (ej. 49000 -> "$49.000").
// -----------------------------------------------------------------------------
export function formatCOP(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value);
}

// Devuelve una oferta de la escalera por su id (o null si no existe).
export function getOffer(id) {
    return OFFER_LADDER.find((o) => o.id === id) || null;
}

// Abre el checkout de Hotmart de una oferta en una pestaña nueva.
// Devuelve true si el link estaba configurado; false si aún no (para que quien
// lo llame decida el respaldo, p. ej. navegar a la página de ofertas).
export function openCheckout(offer) {
    const url = offer && offer.checkoutUrl;
    if (url) {
        window.open(url, '_blank', 'noopener');
        return true;
    }
    return false;
}
