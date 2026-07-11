import React, { useState, useEffect } from 'react';
import {
  getMetas, crearMeta, actualizarMeta, eliminarMeta, agregarAporte
} from '../../services/finanzasService';

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

function diasRestantes(fechaLimite) {
  if (!fechaLimite) return null;
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const fin = new Date(fechaLimite + 'T00:00:00');
  const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  return diff;
}

function Ring({ pct, size = 80, color = '#3B82F6' }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-primary)" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct >= 100 ? '#10B981' : color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fill: 'var(--text-primary)', fontSize: size * 0.18, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {Math.round(Math.min(pct, 100))}%
      </text>
    </svg>
  );
}

const EMOJIS_META = ['🏠','🚗','✈️','💻','📱','🎓','💍','🌴','🎸','💰','🏋️','🎯','🛍️','🐶','🏖️'];
const COLORES_META = ['#3B82F6','#10B981','#F59E0B','#A855F7','#EF4444','#06B6D4','#F97316','#EC4899'];

const FORM_INIT = { nombre: '', emoji: '💰', color: '#3B82F6', objetivo: '', fecha_limite: '', descripcion: '' };
const APORTE_INIT = { monto: '', nota: '', fecha: new Date().toISOString().slice(0, 10) };

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INIT);
  const [guardando, setGuardando] = useState(false);
  const [metaAporte, setMetaAporte] = useState(null);
  const [aporte, setAporte] = useState(APORTE_INIT);
  const [guardandoAporte, setGuardandoAporte] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  const cargar = () => {
    setLoading(true);
    getMetas()
      .then(setMetas)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_INIT);
    setShowForm(true);
  };

  const abrirEditar = (m) => {
    setEditando(m.id);
    setForm({
      nombre: m.nombre,
      emoji: m.emoji || '💰',
      color: m.color || '#3B82F6',
      objetivo: m.objetivo,
      fecha_limite: m.fecha_limite || '',
      descripcion: m.descripcion || ''
    });
    setShowForm(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.objetivo) return;
    setGuardando(true);
    setError('');
    try {
      const payload = { ...form, objetivo: Number(form.objetivo) };
      if (editando) {
        await actualizarMeta(editando, payload);
      } else {
        await crearMeta(payload);
      }
      setShowForm(false);
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleAporte = async (e) => {
    e.preventDefault();
    if (!aporte.monto) return;
    setGuardandoAporte(true);
    setError('');
    try {
      await agregarAporte(metaAporte, { ...aporte, monto: Number(aporte.monto) });
      setMetaAporte(null);
      setAporte(APORTE_INIT);
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardandoAporte(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta meta y todos sus aportes?')) return;
    setEliminando(id);
    try {
      await eliminarMeta(id);
      setMetas(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setEliminando(null);
    }
  };

  const metasActivas = metas.filter(m => (m.acumulado || 0) < m.objetivo);
  const metasCompletadas = metas.filter(m => (m.acumulado || 0) >= m.objetivo);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>🏆 Metas de Ahorro</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Seguimiento de tus objetivos financieros</p>
        </div>
        <button onClick={abrirNuevo} style={btnPrimaryStyle}>+ Nueva Meta</button>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {/* Modal - Formulario Meta */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>{editando ? '✏️ Editar' : '🎯 Nueva'} Meta</h3>
            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Emoji picker */}
              <div>
                <label style={labelStyle}>Ícono</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EMOJIS_META.map(em => (
                    <button key={em} type="button" onClick={() => setF('emoji', em)}
                      style={{ fontSize: '1.4rem', padding: '4px 8px', borderRadius: 8, border: '2px solid', cursor: 'pointer',
                        borderColor: form.emoji === em ? 'var(--accent-color)' : 'var(--border-color)',
                        background: form.emoji === em ? 'var(--bg-accent)' : 'transparent' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color */}
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORES_META.map(c => (
                    <button key={c} type="button" onClick={() => setF('color', c)}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? 'white' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nombre de la meta</label>
                <input required value={form.nombre} onChange={e => setF('nombre', e.target.value)}
                  placeholder="Ej: Viaje a Cartagena" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Monto objetivo (COP)</label>
                <input required type="number" min="1" value={form.objetivo} onChange={e => setF('objetivo', e.target.value)}
                  placeholder="Ej: 5000000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha límite (opcional)</label>
                <input type="date" value={form.fecha_limite} onChange={e => setF('fecha_limite', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea value={form.descripcion} onChange={e => setF('descripcion', e.target.value)}
                  placeholder="¿Para qué es esta meta?" rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnCancelStyle}>Cancelar</button>
                <button type="submit" disabled={guardando} style={btnPrimaryStyle}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Agregar Aporte */}
      {metaAporte && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 380 }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>
              💵 Registrar Aporte — {metas.find(m => m.id === metaAporte)?.nombre}
            </h3>
            <form onSubmit={handleAporte} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Monto (COP)</label>
                <input required type="number" min="1" value={aporte.monto}
                  onChange={e => setAporte(a => ({ ...a, monto: e.target.value }))}
                  placeholder="Ej: 200000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha</label>
                <input type="date" value={aporte.fecha}
                  onChange={e => setAporte(a => ({ ...a, fecha: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nota (opcional)</label>
                <input type="text" value={aporte.nota}
                  onChange={e => setAporte(a => ({ ...a, nota: e.target.value }))}
                  placeholder="Ej: Ahorro semanal" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={() => setMetaAporte(null)} style={btnCancelStyle}>Cancelar</button>
                <button type="submit" disabled={guardandoAporte} style={btnPrimaryStyle}>
                  {guardandoAporte ? '...' : '✅ Agregar Aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : metas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: 12 }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Aún no tienes metas de ahorro</p>
          <button onClick={abrirNuevo} style={btnPrimaryStyle}>+ Crear primera meta</button>
        </div>
      ) : (
        <>
          {/* Metas activas */}
          {metasActivas.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                En progreso ({metasActivas.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: '1.5rem' }}>
                {metasActivas.map(m => {
                  const acum = m.acumulado || 0;
                  const pct = m.objetivo > 0 ? (acum / m.objetivo) * 100 : 0;
                  const dias = diasRestantes(m.fecha_limite);
                  const porMesNecesario = dias && dias > 0 ? ((m.objetivo - acum) / (dias / 30)) : null;
                  return (
                    <div key={m.id} style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${m.color || '#3B82F6'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                            {m.emoji || '💰'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.nombre}</div>
                            {m.descripcion && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.descripcion}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => abrirEditar(m)} style={btnIconStyle('#3B82F620', '#3B82F6')}>✏️</button>
                          <button onClick={() => handleEliminar(m.id)} disabled={eliminando === m.id} style={btnIconStyle('#EF444420', '#EF4444')}>
                            {eliminando === m.id ? '…' : '🗑️'}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Ring pct={pct} color={m.color || '#3B82F6'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Acumulado</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: m.color || '#3B82F6' }}>{formatCOP(acum)}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>de {formatCOP(m.objetivo)}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}>Faltan: {formatCOP(m.objetivo - acum)}</div>
                        </div>
                      </div>

                      {(dias !== null || porMesNecesario) && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {dias !== null && (
                            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 10, background: dias < 30 ? '#EF444420' : 'var(--bg-accent)', color: dias < 30 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                              📅 {dias > 0 ? `${dias} días restantes` : 'Vencida'}
                            </span>
                          )}
                          {porMesNecesario && porMesNecesario > 0 && (
                            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 10, background: 'var(--bg-accent)', color: 'var(--text-secondary)' }}>
                              💡 {formatCOP(porMesNecesario)}/mes
                            </span>
                          )}
                        </div>
                      )}

                      {/* Últimos aportes */}
                      {m.aportes && m.aportes.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>ÚLTIMOS APORTES</div>
                          {m.aportes.slice(-3).reverse().map((a, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '3px 0', borderBottom: '1px solid var(--border-color)' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{a.fecha} {a.nota ? `· ${a.nota}` : ''}</span>
                              <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{formatCOP(a.monto)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button onClick={() => setMetaAporte(m.id)}
                        style={{ ...btnPrimaryStyle, width: '100%', background: `${m.color || '#3B82F6'}` }}>
                        + Agregar Aporte
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Metas completadas */}
          {metasCompletadas.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', color: 'var(--success)', marginBottom: '0.75rem', fontWeight: 600 }}>
                ✅ Completadas ({metasCompletadas.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {metasCompletadas.map(m => (
                  <div key={m.id} style={{ background: 'var(--bg-secondary)', border: '1px solid #10B98140', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '2rem' }}>{m.emoji || '💰'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{m.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ {formatCOP(m.objetivo)} alcanzado</div>
                    </div>
                    <button onClick={() => handleEliminar(m.id)} style={btnIconStyle('#EF444420', '#EF4444')}>🗑️</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: '#00000085', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const modalStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { background: 'var(--bg-accent)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 0.85rem', borderRadius: 8, fontSize: '0.9rem', width: '100%' };
const labelStyle = { fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 };
const btnPrimaryStyle = { background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' };
const btnCancelStyle = { background: 'var(--bg-accent)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 };
const errorStyle = { background: '#EF44441a', border: '1px solid #EF4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#EF4444', fontSize: '0.85rem' };
const btnIconStyle = (bg, color) => ({ background: bg, border: 'none', color, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' });
