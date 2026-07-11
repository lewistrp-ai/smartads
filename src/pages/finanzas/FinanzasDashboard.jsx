import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getResumenMensual } from '../../services/finanzasService';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
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

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: 'var(--bg-accent)', borderRadius: 4, height: 8, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  );
}

export default function FinanzasDashboard() {
  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;
  const [anio, setAnio] = useState(anioActual);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getResumenMensual(anio)
      .then(setTxs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [anio]);

  const txsMes = useMemo(() =>
    txs.filter(t => {
      if (!t.fecha) return false;
      const m = parseInt(t.fecha.slice(5, 7));
      return m === mesSeleccionado;
    }), [txs, mesSeleccionado]);

  const totalIngresos = useMemo(() =>
    txsMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0), [txsMes]);

  const totalEgresos = useMemo(() =>
    txsMes.filter(t => t.tipo === 'egreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0), [txsMes]);

  const balance = totalIngresos - totalEgresos;

  const porCategoria = useMemo(() => {
    const map = {};
    txsMes.filter(t => t.tipo === 'egreso').forEach(t => {
      const cat = t.categoria || 'Otros';
      map[cat] = (map[cat] || 0) + toCOP(t.monto, t.moneda);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [txsMes]);

  const maxCat = porCategoria[0]?.[1] || 1;

  const porMes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const mTxs = txs.filter(t => t.fecha && parseInt(t.fecha.slice(5, 7)) === m);
      return {
        mes: MESES[i],
        ingresos: mTxs.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0),
        egresos: mTxs.filter(t => t.tipo === 'egreso').reduce((s, t) => s + toCOP(t.monto, t.moneda), 0),
      };
    });
  }, [txs]);

  const maxAnual = Math.max(...porMes.map(m => Math.max(m.ingresos, m.egresos)), 1);

  const pendientes = txsMes.filter(t => t.estado === 'POR PAGAR');
  const totalPendiente = pendientes.reduce((s, t) => s + toCOP(t.monto, t.moneda), 0);

  const CAT_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#A855F7','#06B6D4','#F97316','#EC4899'];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>💵 Finanzas</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Control total de ingresos y egresos</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={anio}
            onChange={e => setAnio(Number(e.target.value))}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.9rem' }}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Link to="/finanzas/nueva" style={{
            background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem',
            borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap'
          }}>+ Nueva</Link>
        </div>
      </div>

      {error && <div style={{ background: '#EF44441a', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}

      {/* Selector de mes */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: 4 }}>
        {MESES_FULL.map((m, i) => (
          <button
            key={i}
            onClick={() => setMesSeleccionado(i + 1)}
            style={{
              padding: '0.4rem 0.85rem', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: '0.82rem', fontWeight: 600, flexShrink: 0,
              background: mesSeleccionado === i + 1 ? 'var(--accent-color)' : 'var(--bg-accent)',
              color: mesSeleccionado === i + 1 ? 'white' : 'var(--text-secondary)',
            }}
          >{m}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            <StatCard label="Balance" value={formatCOP(balance)} color={balance >= 0 ? 'var(--success)' : 'var(--danger)'} icon="⚖️" sub={`${MESES_FULL[mesSeleccionado-1]} ${anio}`} />
            <StatCard label="Ingresos" value={formatCOP(totalIngresos)} color="var(--success)" icon="📈" sub={`${txsMes.filter(t=>t.tipo==='ingreso').length} transacciones`} />
            <StatCard label="Egresos" value={formatCOP(totalEgresos)} color="var(--danger)" icon="📉" sub={`${txsMes.filter(t=>t.tipo==='egreso').length} transacciones`} />
            <StatCard label="Por Pagar" value={formatCOP(totalPendiente)} color="var(--warning)" icon="⏳" sub={`${pendientes.length} pendientes`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
            {/* Gastos por categoría */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>Egresos por Categoría</h3>
              {porCategoria.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Sin datos este mes</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {porCategoria.map(([cat, val], i) => (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], display: 'inline-block' }} />
                          {cat}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--danger)' }}>{formatCOP(val)}</span>
                      </div>
                      <MiniBar value={val} max={maxCat} color={CAT_COLORS[i % CAT_COLORS.length]} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evolución anual */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>Evolución {anio}</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, paddingBottom: 20, position: 'relative' }}>
                {porMes.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => setMesSeleccionado(i + 1)}>
                    <div style={{ width: '100%', display: 'flex', gap: 1, alignItems: 'flex-end', height: 90 }}>
                      <div style={{
                        flex: 1, background: i + 1 === mesSeleccionado ? '#10B981' : '#10B98166',
                        borderRadius: '2px 2px 0 0',
                        height: `${(m.ingresos / maxAnual) * 90}px`,
                        minHeight: m.ingresos > 0 ? 2 : 0,
                        transition: 'height 0.3s'
                      }} />
                      <div style={{
                        flex: 1, background: i + 1 === mesSeleccionado ? '#EF4444' : '#EF444466',
                        borderRadius: '2px 2px 0 0',
                        height: `${(m.egresos / maxAnual) * 90}px`,
                        minHeight: m.egresos > 0 ? 2 : 0,
                        transition: 'height 0.3s'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.55rem', color: i + 1 === mesSeleccionado ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i + 1 === mesSeleccionado ? 700 : 400 }}>{m.mes}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>🟢 Ingresos</span>
                <span>🔴 Egresos</span>
              </div>
            </div>
          </div>

          {/* Últimas transacciones del mes */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Transacciones — {MESES_FULL[mesSeleccionado-1]}</h3>
              <Link to="/finanzas/transacciones" style={{ fontSize: '0.8rem', color: 'var(--accent-color)', textDecoration: 'none' }}>Ver todas →</Link>
            </div>
            {txsMes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '0.75rem' }}>Sin transacciones este mes</p>
                <Link to="/finanzas/nueva" style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  + Agregar primera transacción
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {txsMes.slice(0, 8).map(t => (
                  <Link key={t.id} to={`/finanzas/transacciones`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.7rem 0.85rem', background: 'var(--bg-accent)', borderRadius: 8,
                      cursor: 'pointer', transition: 'opacity 0.2s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.tipo === 'ingreso' ? '📈' : '📉'}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                            {t.concepto || t.notas || 'Sin descripción'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t.categoria} · {t.cuenta} · {t.fecha}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: t.tipo === 'ingreso' ? 'var(--success)' : 'var(--danger)' }}>
                          {t.tipo === 'ingreso' ? '+' : '-'}{formatCOP(toCOP(t.monto, t.moneda))}
                        </div>
                        <span style={{
                          fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10,
                          background: t.estado === 'PAGO' ? '#10B98120' : '#F59E0B20',
                          color: t.estado === 'PAGO' ? 'var(--success)' : 'var(--warning)'
                        }}>{t.estado}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
