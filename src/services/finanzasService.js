import { supabase } from './supabase';

export const CATEGORIAS_EGRESO = [
  'Carro', 'Casa', 'Comida', 'Comidas por fuera', 'Compras personales',
  'Educación', 'Familia', 'Hotmart', 'Marcas', 'Merienda', 'Música',
  'Novia', 'Otros', 'Pago de trabajo', 'Plataformas', 'Seguridad social',
  'Servicios', 'Smarfit', 'Taller', 'Talleres', 'Transporte', 'Vestimenta', 'Asesoría'
];

export const CATEGORIAS_INGRESO = [
  'Salario', 'Freelance', 'Ventas', 'Inversiones', 'Meta Ads', 'TikTok Ads',
  'Clientes', 'Comisiones', 'Transferencia', 'Otros'
];

export const CONCEPTOS_EGRESO = [
  'ADOBE CREATIVE CLOUD', 'APPLE CLOUD', 'APPLE MUSIC', 'ARRIENDO',
  'CAP CUT PRO', 'CHAT GPT PLUS', 'CLASE DE TROMPETA', 'CUOTA DEL CARRO',
  'EPM', 'GASOLINA', 'GOOD NOTES', 'GOOGLE ONE', 'GYM', 'MANTENIMIENTO DEL CARRO',
  'MANYCHAT', 'META ADS', 'MICROSOFT', 'MOISES', 'NETFLIX', 'OTROS',
  'OTROS GASTOS DEL CARRO', 'PARQUEADERO', 'PEAJES', 'PHOTOSHOP Y LIGHTROOM',
  'PLAN DEL CEL CLARO', 'SEGURIDAD SOCIAL', 'SERED', 'SMARFIT', 'SPOTIFY',
  'TIGO', 'TIK TOK ADS', 'VERIFICACIÓN INSTAGRAM', 'VIDIQ', 'YOUTUBE PREMIUM', 'ZOOM'
];

export const CUENTAS = ['Bancolombia', 'Efectivo', 'Nequi'];
export const MONEDAS = ['COP', 'USD', 'EUR'];
export const TIPOS_PAGO = ['PERSONAL', 'CASA', 'TRABAJO'];
export const ESTADOS = ['PAGO', 'POR PAGAR'];

export async function getTransacciones({ mes, anio, tipo, categoria, cuenta, estado } = {}) {
  let query = supabase
    .from('transacciones')
    .select('*')
    .order('fecha', { ascending: false });

  if (mes && anio) {
    const inicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const fin = new Date(anio, mes, 0);
    const finStr = `${anio}-${String(mes).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`;
    query = query.gte('fecha', inicio).lte('fecha', finStr);
  } else if (anio) {
    query = query.gte('fecha', `${anio}-01-01`).lte('fecha', `${anio}-12-31`);
  }

  if (tipo) query = query.eq('tipo', tipo);
  if (categoria) query = query.eq('categoria', categoria);
  if (cuenta) query = query.eq('cuenta', cuenta);
  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function crearTransaccion(tx) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('transacciones')
    .insert([{ ...tx, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarTransaccion(id, tx) {
  const { data, error } = await supabase
    .from('transacciones')
    .update(tx)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarTransaccion(id) {
  const { error } = await supabase
    .from('transacciones')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getResumenMensual(anio) {
  const { data, error } = await supabase
    .from('transacciones')
    .select('tipo, monto, moneda, fecha, categoria, estado')
    .gte('fecha', `${anio}-01-01`)
    .lte('fecha', `${anio}-12-31`);
  if (error) throw error;
  return data;
}

// ── Presupuestos ──────────────────────────────────────────────────────────────
export async function getPresupuestos() {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('categoria');
  if (error) throw error;
  return data;
}

export async function crearPresupuesto(p) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('presupuestos')
    .insert([{ ...p, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarPresupuesto(id, p) {
  const { data, error } = await supabase
    .from('presupuestos')
    .update(p)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarPresupuesto(id) {
  const { error } = await supabase.from('presupuestos').delete().eq('id', id);
  if (error) throw error;
}

// ── Metas de Ahorro ───────────────────────────────────────────────────────────
export async function getMetas() {
  const { data: metas, error } = await supabase
    .from('metas_ahorro')
    .select('*, aportes_meta(monto, fecha, nota)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (metas || []).map(m => ({
    ...m,
    aportes: m.aportes_meta || [],
    acumulado: (m.aportes_meta || []).reduce((s, a) => s + (a.monto || 0), 0)
  }));
}

export async function crearMeta(m) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('metas_ahorro')
    .insert([{ ...m, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarMeta(id, m) {
  const { data, error } = await supabase
    .from('metas_ahorro')
    .update(m)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarMeta(id) {
  await supabase.from('aportes_meta').delete().eq('meta_id', id);
  const { error } = await supabase.from('metas_ahorro').delete().eq('id', id);
  if (error) throw error;
}

export async function agregarAporte(metaId, aporte) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('aportes_meta')
    .insert([{ ...aporte, meta_id: metaId, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Export CSV ─────────────────────────────────────────────────────────────────
export function exportarCSV(txs, nombreArchivo = 'finanzas.csv') {
  const cols = ['fecha', 'tipo', 'concepto', 'categoria', 'subcategoria', 'monto', 'moneda', 'cuenta', 'tipo_pago', 'estado', 'notas'];
  const header = cols.join(',');
  const rows = txs.map(t =>
    cols.map(c => {
      const v = t[c] ?? '';
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
