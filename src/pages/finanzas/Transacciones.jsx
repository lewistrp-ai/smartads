import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getTransacciones, eliminarTransaccion,
  CATEGORIAS_EGRESO, CATEGORIAS_INGRESO, CUENTAS, ESTADOS, MONEDAS
} from '../../services/finanzasService';

const MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const USD_TO_COP = 4200;
const EUR_TO_COP = 4600;

function toCOP(monto, moneda) {
  if (moneda === 'USD') return monto * USD_TO_COP;
  if (moneda === 'EUR') return monto * EUR_TO_COP;
  return monto;
}

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Transacciones() {
  const navigate = useNavigate();
  const now = new Date();
  const [filtros, setFiltros] = useState({
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
    tipo: '',
    categoria: '',
    cuenta: '',
    estado: '',
  });
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    setError('');
    getTransacciones(filtros)
      .then(setTxs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta transacción?')) return;
    setEliminando(id);
    try {
      await eliminarTransaccion(id);
      setTxs(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setEliminando(null);
    }
  };

  const txsFiltradas = txs.filter(t => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (t.concepto || '').toLowerCase().includes(q) ||
      (t.notas || '').toLowerCase().includes(q) ||
      (t.categoria || '').toLowerCase().includes(q);
  });

  const totalIngresos = txsFiltradas.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0);
  const totalEgresos = txsFiltradas.filter(t => t.tipo === 'egreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0);

  const setF = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>📋 Transacciones</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Historial completo de ingresos y egresos</p>
        </div>
        <Link to="/finanzas/nueva" style={{
          background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
        }}>+ Nueva</Link>
      </div>

      {/* Filtros */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          <select value={filtros.mes} onChange={e => setF('mes', Number(e.target.value))}
            style={selectStyle}>
            {MESES_FULL.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={filtros.anio} onChange={e => setF('anio', Number(e.target.value))}
            style={selectStyle}>
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filtros.tipo} onChange={e => setF('tipo', e.target.value)} style={selectStyle}>
            <option value="">Todos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
          <select value={filtros.cuenta} onChange={e => setF('cuenta', e.target.value)} style={selectStyle}>
            <option value="">Cuenta</option>
            {CUENTAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtros.estado} onChange={e => setF('estado', e.target.value)} style={selectStyle}>
            <option value="">Estado</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            type="text" placeholder="Buscar..." value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...selectStyle, gridColumn: 'span 1' }}
          />
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1rem' }}>
        {[
          { label: 'Ingresos', val: totalIngresos, color: 'var(--success)', icon: '📈' },
          { label: 'Egresos', val: totalEgresos, color: 'var(--danger)', icon: '📉' },
          { label: 'Balance', val: totalIngresos - totalEgresos, color: (totalIngresos - totalEgresos) >= 0 ? 'var(--success)' : 'var(--danger)', icon: '⚖️' },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '0.85rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, color, fontSize: '0.95rem' }}>{formatCOP(val)}</div>
          </div>
        ))}
      </div>

      {error && <div style={{ background: '#EF44441a', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : txsFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <p style={{ marginBottom: '1rem' }}>No hay transacciones</p>
          <Link to="/finanzas/nueva" style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            + Agregar transacción
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {txsFiltradas.map(t => (
            <div key={t.id} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 10, padding: '0.9rem 1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: t.tipo === 'ingreso' ? '#10B98120' : '#EF444420',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                }}>
                  {t.tipo === 'ingreso' ? '📈' : '📉'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.concepto || t.notas || 'Sin descripción'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                    {t.fecha && <span>📅 {t.fecha}</span>}
                    {t.categoria && <span>🏷️ {t.categoria}</span>}
                    {t.cuenta && <span>🏦 {t.cuenta}</span>}
                    {t.tipo_pago && <span>💼 {t.tipo_pago}</span>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: t.tipo === 'ingreso' ? 'var(--success)' : 'var(--danger)' }}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{formatCOP(toCOP(t.monto, t.moneda))}
                </div>
                {t.moneda !== 'COP' && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.monto} {t.moneda}</div>
                )}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{
                    fontSize: '0.7rem', padding: '1px 8px', borderRadius: 10,
                    background: t.estado === 'PAGO' ? '#10B98120' : '#F59E0B20',
                    color: t.estado === 'PAGO' ? 'var(--success)' : 'var(--warning)'
                  }}>{t.estado}</span>
                  <button onClick={() => navigate(`/finanzas/editar/${t.id}`)} style={btnSmall('#3B82F620', '#3B82F6')}>✏️</button>
                  <button onClick={() => handleEliminar(t.id)} disabled={eliminando === t.id} style={btnSmall('#EF444420', '#EF4444')}>
                    {eliminando === t.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  background: 'var(--bg-accent)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', padding: '0.45rem 0.65rem',
  borderRadius: 8, fontSize: '0.82rem', width: '100%'
};

const btnSmall = (bg, color) => ({
  background: bg, border: 'none', color, padding: '3px 7px',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem'
});
