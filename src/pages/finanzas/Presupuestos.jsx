import React, { useState, useEffect, useMemo } from 'react';
import {
  getPresupuestos, crearPresupuesto, actualizarPresupuesto, eliminarPresupuesto,
  getTransacciones, CATEGORIAS_EGRESO
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

function ProgressBar({ pct, color }) {
  const clamped = Math.min(pct, 100);
  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 6, height: 10, width: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        width: `${clamped}%`, height: '100%', borderRadius: 6,
        background: pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : color,
        transition: 'width 0.6s ease'
      }} />
    </div>
  );
}

const COLORES_CAT = ['#3B82F6','#10B981','#F59E0B','#A855F7','#06B6D4','#F97316','#EC4899','#EF4444','#84CC16','#14B8A6'];

export default function Presupuestos() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [presupuestos, setPresupuestos] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ categoria: '', limite: '', aplica_todos_meses: false });
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      getPresupuestos(),
      getTransacciones({ mes, anio, tipo: 'egreso' })
    ])
      .then(([p, t]) => { setPresupuestos(p); setTxs(t); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [mes, anio]);

  const gastoPorCategoria = useMemo(() => {
    const map = {};
    txs.forEach(t => {
      const cat = t.categoria || 'Otros';
      map[cat] = (map[cat] || 0) + toCOP(t.monto, t.moneda);
    });
    return map;
  }, [txs]);

  const presupuestosMes = useMemo(() =>
    presupuestos.filter(p => p.aplica_todos_meses || (p.mes === mes && p.anio === anio)),
    [presupuestos, mes, anio]
  );

  const categoriasSinPresupuesto = CATEGORIAS_EGRESO.filter(
    c => !presupuestosMes.find(p => p.categoria === c)
  );

  const totalPresupuestado = presupuestosMes.reduce((s, p) => s + p.limite, 0);
  const totalGastado = presupuestosMes.reduce((s, p) => s + (gastoPorCategoria[p.categoria] || 0), 0);
  const totalExcedido = presupuestosMes.filter(p => (gastoPorCategoria[p.categoria] || 0) > p.limite).length;

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ categoria: categoriasSinPresupuesto[0] || '', limite: '', aplica_todos_meses: false });
    setShowForm(true);
  };

  const abrirEditar = (p) => {
    setEditando(p.id);
    setForm({ categoria: p.categoria, limite: p.limite, aplica_todos_meses: p.aplica_todos_meses });
    setShowForm(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.categoria || !form.limite) return;
    setGuardando(true);
    setError('');
    try {
      const payload = {
        categoria: form.categoria,
        limite: Number(form.limite),
        mes: form.aplica_todos_meses ? null : mes,
        anio: form.aplica_todos_meses ? null : anio,
        aplica_todos_meses: form.aplica_todos_meses
      };
      if (editando) {
        await actualizarPresupuesto(editando, payload);
      } else {
        await crearPresupuesto(payload);
      }
      setShowForm(false);
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    setEliminando(id);
    try {
      await eliminarPresupuesto(id);
      setPresupuestos(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>🎯 Presupuestos</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Límites de gasto por categoría</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={mes} onChange={e => setMes(Number(e.target.value))} style={selStyle}>
            {MESES_FULL.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={anio} onChange={e => setAnio(Number(e.target.value))} style={selStyle}>
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={abrirNuevo} style={btnPrimaryStyle}>+ Agregar</button>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Modal formulario */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>{editando ? '✏️ Editar' : '➕ Nuevo'} Presupuesto</h3>
            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Categoría</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={inputStyle} required>
                  <option value="">Seleccionar...</option>
                  {(editando ? CATEGORIAS_EGRESO : categoriasSinPresupuesto).map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Límite mensual (COP)</label>
                <input
                  type="number" min="0" step="1000" required
                  value={form.limite} onChange={e => setForm(f => ({ ...f, limite: e.target.value }))}
                  placeholder="Ej: 500000" style={inputStyle}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox" checked={form.aplica_todos_meses}
                  onChange={e => setForm(f => ({ ...f, aplica_todos_meses: e.target.checked }))}
                  style={{ width: 16, height: 16 }}
                />
                Aplicar a todos los meses
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnCancelStyle}>Cancelar</button>
                <button type="submit" disabled={guardando} style={btnPrimaryStyle}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPIs */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Presupuestado', val: formatCOP(totalPresupuestado), color: 'var(--accent-color)', icon: '🎯' },
            { label: 'Gastado', val: formatCOP(totalGastado), color: totalGastado > totalPresupuestado ? 'var(--danger)' : 'var(--success)', icon: '💸' },
            { label: 'Disponible', val: formatCOP(Math.max(0, totalPresupuestado - totalGastado)), color: 'var(--success)', icon: '✅' },
            { label: 'Excedidos', val: `${totalExcedido} categorías`, color: totalExcedido > 0 ? 'var(--danger)' : 'var(--text-secondary)', icon: '⚠️' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{k.label}</span>
                <span>{k.icon}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : presupuestosMes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <p style={{ marginBottom: '1rem' }}>No hay presupuestos para {MESES_FULL[mes-1]}</p>
          <button onClick={abrirNuevo} style={btnPrimaryStyle}>+ Crear primer presupuesto</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {presupuestosMes.map((p, i) => {
            const gastado = gastoPorCategoria[p.categoria] || 0;
            const pct = p.limite > 0 ? (gastado / p.limite) * 100 : 0;
            const excedido = gastado > p.limite;
            const color = COLORES_CAT[i % COLORES_CAT.length];
            return (
              <div key={p.id} style={{ background: 'var(--bg-secondary)', border: `1px solid ${excedido ? '#EF444440' : 'var(--border-color)'}`, borderRadius: 12, padding: '1.1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.categoria}</div>
                      {p.aplica_todos_meses && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-accent)', padding: '1px 6px', borderRadius: 8 }}>Todos los meses</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {excedido && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700 }}>⚠️ Excedido</span>}
                    <button onClick={() => abrirEditar(p)} style={btnIconStyle('#3B82F620', '#3B82F6')}>✏️</button>
                    <button onClick={() => handleEliminar(p.id)} disabled={eliminando === p.id} style={btnIconStyle('#EF444420', '#EF4444')}>
                      {eliminando === p.id ? '…' : '🗑️'}
                    </button>
                  </div>
                </div>
                <ProgressBar pct={pct} color={color} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.82rem' }}>
                  <span style={{ color: excedido ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    Gastado: <strong style={{ color: excedido ? 'var(--danger)' : 'var(--text-primary)' }}>{formatCOP(gastado)}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Límite: <strong style={{ color: 'var(--text-primary)' }}>{formatCOP(p.limite)}</strong>
                  </span>
                  <span style={{ color: excedido ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                    {excedido ? `+${formatCOP(gastado - p.limite)}` : `${formatCOP(p.limite - gastado)} libre`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const selStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.65rem', borderRadius: 8, fontSize: '0.85rem' };
const inputStyle = { background: 'var(--bg-accent)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 0.85rem', borderRadius: 8, fontSize: '0.9rem', width: '100%' };
const labelStyle = { fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 };
const btnPrimaryStyle = { background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' };
const btnCancelStyle = { background: 'var(--bg-accent)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 };
const errorStyle = { background: '#EF44441a', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' };
const btnIconStyle = (bg, color) => ({ background: bg, border: 'none', color, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' });
