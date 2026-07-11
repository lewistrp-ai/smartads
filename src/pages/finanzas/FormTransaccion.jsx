import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  crearTransaccion, actualizarTransaccion, getTransacciones,
  CATEGORIAS_EGRESO, CATEGORIAS_INGRESO, CONCEPTOS_EGRESO,
  CUENTAS, MONEDAS, TIPOS_PAGO, ESTADOS
} from '../../services/finanzasService';

const INIT = {
  tipo: 'egreso',
  monto: '',
  moneda: 'COP',
  fecha: new Date().toISOString().slice(0, 10),
  concepto: '',
  categoria: '',
  subcategoria: '',
  cuenta: 'Bancolombia',
  tipo_pago: 'PERSONAL',
  estado: 'PAGO',
  notas: '',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

export default function FormTransaccion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    getTransacciones({})
      .then(txs => {
        const tx = txs.find(t => t.id === id);
        if (tx) {
          setForm({
            tipo: tx.tipo || 'egreso',
            monto: tx.monto || '',
            moneda: tx.moneda || 'COP',
            fecha: tx.fecha || INIT.fecha,
            concepto: tx.concepto || '',
            categoria: tx.categoria || '',
            subcategoria: tx.subcategoria || '',
            cuenta: tx.cuenta || 'Bancolombia',
            tipo_pago: tx.tipo_pago || 'PERSONAL',
            estado: tx.estado || 'PAGO',
            notas: tx.notas || '',
          });
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingData(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.monto || isNaN(Number(form.monto))) { setError('Ingresa un monto válido'); return; }
    if (!form.fecha) { setError('Selecciona una fecha'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, monto: Number(form.monto) };
      if (isEdit) {
        await actualizarTransaccion(id, payload);
      } else {
        await crearTransaccion(payload);
      }
      navigate('/finanzas/transacciones');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const categorias = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;

  if (loadingData) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-accent)', border: 'none', color: 'var(--text-primary)', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' }}>← Volver</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            {isEdit ? '✏️ Editar' : '➕ Nueva'} Transacción
          </h1>
        </div>
      </div>

      {error && <div style={{ background: '#EF44441a', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Tipo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['egreso', 'ingreso'].map(t => (
            <button
              key={t} type="button"
              onClick={() => { set('tipo', t); set('categoria', ''); set('concepto', ''); }}
              style={{
                padding: '0.85rem', borderRadius: 10, border: '2px solid',
                borderColor: form.tipo === t ? (t === 'ingreso' ? 'var(--success)' : 'var(--danger)') : 'var(--border-color)',
                background: form.tipo === t ? (t === 'ingreso' ? '#10B98115' : '#EF444415') : 'var(--bg-secondary)',
                color: form.tipo === t ? (t === 'ingreso' ? 'var(--success)' : 'var(--danger)') : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                transition: 'all 0.2s'
              }}
            >
              {t === 'ingreso' ? '📈 Ingreso' : '📉 Egreso'}
            </button>
          ))}
        </div>

        {/* Monto + Moneda */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
          <Field label="Monto">
            <input
              type="number" step="0.01" min="0" required
              value={form.monto} onChange={e => set('monto', e.target.value)}
              placeholder="0.00"
              style={inputStyle}
            />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={e => set('moneda', e.target.value)} style={{ ...inputStyle, minWidth: 90 }}>
              {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        {/* Fecha */}
        <Field label="Fecha">
          <input
            type="date" required
            value={form.fecha} onChange={e => set('fecha', e.target.value)}
            style={inputStyle}
          />
        </Field>

        {/* Concepto (solo egresos) */}
        {form.tipo === 'egreso' && (
          <Field label="Concepto">
            <select value={form.concepto} onChange={e => set('concepto', e.target.value)} style={inputStyle}>
              <option value="">Seleccionar...</option>
              {CONCEPTOS_EGRESO.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        )}

        {/* Categoría */}
        <Field label="Categoría">
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)} style={inputStyle}>
            <option value="">Seleccionar...</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        {/* Subcategoría */}
        <Field label="Subcategoría (opcional)">
          <input
            type="text" value={form.subcategoria}
            onChange={e => set('subcategoria', e.target.value)}
            placeholder="Ej: Netflix básico"
            style={inputStyle}
          />
        </Field>

        {/* Cuenta + Tipo Pago */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Cuenta">
            <select value={form.cuenta} onChange={e => set('cuenta', e.target.value)} style={inputStyle}>
              {CUENTAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Tipo de Pago">
            <select value={form.tipo_pago} onChange={e => set('tipo_pago', e.target.value)} style={inputStyle}>
              {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        {/* Estado */}
        <Field label="Estado">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['PAGO', 'POR PAGAR'].map(e => (
              <button
                key={e} type="button"
                onClick={() => set('estado', e)}
                style={{
                  padding: '0.6rem', borderRadius: 8, border: '1px solid',
                  borderColor: form.estado === e ? (e === 'PAGO' ? 'var(--success)' : 'var(--warning)') : 'var(--border-color)',
                  background: form.estado === e ? (e === 'PAGO' ? '#10B98115' : '#F59E0B15') : 'var(--bg-secondary)',
                  color: form.estado === e ? (e === 'PAGO' ? 'var(--success)' : 'var(--warning)') : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >{e === 'PAGO' ? '✅ PAGADO' : '⏳ POR PAGAR'}</button>
            ))}
          </div>
        </Field>

        {/* Notas */}
        <Field label="Notas (opcional)">
          <textarea
            value={form.notas} onChange={e => set('notas', e.target.value)}
            placeholder="Descripción o nota adicional..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
          />
        </Field>

        {/* Botones */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={() => navigate(-1)}
            style={{ padding: '0.85rem', background: 'var(--bg-accent)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            style={{
              padding: '0.85rem', background: loading ? 'var(--bg-accent)' : 'var(--accent-color)',
              border: 'none', color: loading ? 'var(--text-secondary)' : 'white',
              borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem'
            }}>
            {loading ? 'Guardando...' : isEdit ? '💾 Guardar cambios' : '✅ Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg-accent)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', padding: '0.6rem 0.85rem',
  borderRadius: 8, fontSize: '0.9rem', width: '100%', outline: 'none'
};
