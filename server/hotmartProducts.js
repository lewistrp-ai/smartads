// =============================================================================
// Hotmart · Mapa de productos -> acceso en Smart Ads
// -----------------------------------------------------------------------------
// Traduce cada producto comprado en Hotmart a lo que desbloquea dentro de la app
// (rol/plan del usuario en Supabase). Lo usa el webhook /api/hotmart/webhook.
//
// CÓMO CONFIGURARLO (una sola vez, cuando publiques cada producto en Hotmart):
//   1. En Hotmart, abre el producto y copia su "ID de producto".
//   2. Pega ese ID como clave en PRODUCTS con el acceso que otorga.
// El ID llega en el webhook como data.product.id.
//
// Recordatorio de cómo el frontend lee el acceso (src/config/ladder.js):
//   - plan 'pro' o 'agency'  -> desbloquea TODOS los niveles de la Academy.
//   - role 'workshop'        -> desbloquea el Nivel 1 (asistente al taller).
// Por eso la membresía recurrente otorga plan 'pro' (acceso total mientras pague).
// =============================================================================

const PRODUCTS = {
    // Ejemplos (descomenta y reemplaza el ID por el real de Hotmart):
    //
    // Membresía Smart Ads (recurrente) -> acceso total mientras esté activa:
    // '1234567': { plan: 'pro', role: 'pro', recurring: true, label: 'Membresía Smart Ads' },
    //
    // Taller / Nivel 1 (pago único) -> acceso de por vida al Nivel 1:
    // '2345678': { role: 'workshop', recurring: false, label: 'Taller · Nivel 1' },
    //
    // Nivel 2 o Nivel 3 (pago único) -> acceso total a la Academy:
    // '3456789': { plan: 'pro', recurring: false, label: 'Nivel 2 · Optimización' },
};

// La membresía es lo más importante, así que también se puede configurar solo con
// una variable de entorno (sin tocar este archivo): HOTMART_MEMBERSHIP_PRODUCT_ID.
const MEMBERSHIP_ID = process.env.HOTMART_MEMBERSHIP_PRODUCT_ID;
if (MEMBERSHIP_ID) {
    PRODUCTS[String(MEMBERSHIP_ID)] = { plan: 'pro', role: 'pro', recurring: true, label: 'Membresía Smart Ads' };
}

// Si llega un producto que aún no está mapeado, damos como mínimo acceso de
// entrada (Nivel 1) para no dejar al comprador sin nada. Ajusta si lo prefieres.
const DEFAULT_GRANT = { role: 'workshop', recurring: false, label: 'Producto Smart Ads (acceso Nivel 1)' };

// Eventos de Hotmart que OTORGAN acceso.
const GRANT_EVENTS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'];
// Eventos que REVOCAN acceso (reembolso, contracargo, cancelación de suscripción).
const REVOKE_EVENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST', 'SUBSCRIPTION_CANCELLATION'];

function eventAction(event) {
    if (GRANT_EVENTS.includes(event)) return 'grant';
    if (REVOKE_EVENTS.includes(event)) return 'revoke';
    return 'ignore';
}

function resolveGrant(productId) {
    return PRODUCTS[String(productId)] || DEFAULT_GRANT;
}

module.exports = { PRODUCTS, DEFAULT_GRANT, eventAction, resolveGrant };
