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
