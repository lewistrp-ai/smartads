# Conectar Hotmart con Smart Ads (acceso automático al pagar)

Cuando un alumno paga en Hotmart, este webhook actualiza su acceso en la app
automáticamente: la **membresía** le da acceso total (`plan: pro`) mientras pague,
y si **cancela o le reembolsan**, se le retira. Los talleres/niveles de pago único
dan acceso de por vida.

## 1. Variables de entorno (archivo `server/.env`)

Copia `server/.env.example` y completa:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase > Settings > API > service_role (SECRETA)
HOTMART_HOTTOK=...              # Hotmart te lo da al crear el webhook (paso 3)
HOTMART_MEMBERSHIP_PRODUCT_ID=  # (opcional) ID del producto de la membresía
```

> ⚠️ La `service_role` key es secreta y solo va en el backend. Nunca en el frontend.

## 2. Mapear tus productos

Cada producto de Hotmart se traduce a un acceso en `server/hotmartProducts.js`.
Abre Hotmart, copia el **ID de producto** y pégalo ahí. Ejemplo:

```js
const PRODUCTS = {
  '1234567': { plan: 'pro', role: 'pro', recurring: true,  label: 'Membresía Smart Ads' },
  '2345678': { role: 'workshop',          recurring: false, label: 'Taller · Nivel 1' },
  '3456789': { plan: 'pro',               recurring: false, label: 'Nivel 2 · Optimización' },
};
```

Recordatorio de cómo el frontend interpreta el acceso:
- `plan: 'pro'` (o `'agency'`) → desbloquea **todos** los niveles de la Academy.
- `role: 'workshop'` → desbloquea el **Nivel 1**.

## 3. Registrar el webhook en Hotmart

En Hotmart: **Herramientas → Webhook (API)** → añade la URL:

```
https://TU-BACKEND/api/hotmart/webhook
```

Selecciona los eventos: `Compra aprobada`, `Compra completa`, `Reembolso`,
`Chargeback` y `Cancelación de suscripción`. Copia el **Hottok** que te muestra y
pégalo en `HOTMART_HOTTOK`.

## 4. Listo

- Al pagar → el alumno pasa a `pro` y entra a todo.
- Al cancelar/reembolsar la membresía → vuelve a `free`.
- Si alguien compra **antes** de registrarse en la app, queda registrado en el log
  del servidor (con su email) para asignarlo cuando cree su cuenta con ese correo.
