import React, { useState, useEffect } from 'react';

function BudgetCalculator() {
    const [inputs, setInputs] = useState({
        revenue: '10000',
        ticketPrice: '100',
        conversionRate: '2',
        cpc: '0.40',
        ctr: '1.5',
        currency: 'USD',
        objective: 'web'
    });

    const [results, setResults] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const calculateBudget = (e) => {
        if (e) e.preventDefault();

        const revenue = parseFloat(inputs.revenue) || 0;
        const ticket = parseFloat(inputs.ticketPrice) || 0;
        const cvrStr = inputs.conversionRate;
        const cvr = (parseFloat(cvrStr) || 0) / 100;
        const cpc = parseFloat(inputs.cpc) || 0;
        const ctr = (parseFloat(inputs.ctr) || 0) / 100;

        if (revenue === 0 || ticket === 0 || cvr === 0 || cpc === 0 || ctr === 0) {
            setResults(null);
            return;
        }

        const salesNeeded = Math.ceil(revenue / ticket);
        const clicksNeeded = Math.ceil(salesNeeded / cvr);
        const impressionsNeeded = Math.ceil(clicksNeeded / ctr);
        const totalBudget = clicksNeeded * cpc;
        const cpm = (totalBudget / impressionsNeeded) * 1000;
        const roas = revenue / totalBudget;

        // Strategic Interpretation Calculations
        const breakEvenSales = Math.ceil(totalBudget / ticket);
        const breakEvenRoas = 1.0; // 1x is theoretically break-even on ad spend
        const minCtr = (cpc / (ticket * cvr)) * 100; // Minimum CTR needed to break even

        // Variations Math
        const cvrDrop = Math.max(0.1, (parseFloat(cvrStr) - 1)) / 100; // Drops 1% or to 0.1% minimum
        const clicksNeededWithDrop = Math.ceil(salesNeeded / cvrDrop);
        const budgetWithCvrDrop = clicksNeededWithDrop * cpc;

        const cpmRise = cpm * 1.5; // If CPM rises 50%
        const budgetWithCpmRise = (impressionsNeeded / 1000) * cpmRise;

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat(inputs.currency === 'COP' ? 'es-CO' : 'en-US', {
                style: 'currency',
                currency: inputs.currency,
                maximumFractionDigits: inputs.currency === 'COP' ? 0 : 2
            }).format(amount);
        };

        setResults({
            salesNeeded,
            clicksNeeded,
            impressionsNeeded,
            totalBudget: parseFloat(totalBudget), // Keep as number for math later
            formattedBudget: formatCurrency(totalBudget),
            formattedDailyBudget: formatCurrency(totalBudget / 30),
            formattedCpm: formatCurrency(cpm),
            roas: roas.toFixed(2),
            currency: inputs.currency,
            objective: inputs.objective,
            strats: {
                breakEvenSales,
                minCtr: minCtr.toFixed(2),
                budgetWithCvrDrop: formatCurrency(budgetWithCvrDrop),
                budgetWithCpmRise: formatCurrency(budgetWithCpmRise),
                cpmRiseFormatted: formatCurrency(cpmRise)
            }
        });
    };

    // Auto calculate on mount
    useEffect(() => {
        calculateBudget();
    }, []);

    return (
        <div className="budget-calculator">
            <h1>Calculadora de Presupuestos (Ingeniería Inversa)</h1>
            <p className="subtitle">Descubre exactamente cuánto necesitas invertir para alcanzar tu meta de facturación.</p>

            <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: results ? '1fr 1fr' : '1fr', maxWidth: results ? '100%' : '600px' }}>
                <div className="card">
                    <form onSubmit={calculateBudget}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Tus Metas y KPIs Actuales</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Moneda Operativa</label>
                                <select name="currency" value={inputs.currency} onChange={handleInputChange} className="form-control">
                                    <option value="USD">Dólares (USD)</option>
                                    <option value="COP">Pesos Colombianos (COP)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Destino del Tráfico</label>
                                <select name="objective" value={inputs.objective} onChange={handleInputChange} className="form-control">
                                    <option value="web">Página Web / Landing</option>
                                    <option value="whatsapp">Mensajes de WhatsApp</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                            <label>Meta de Facturación Mensual ({inputs.currency})</label>
                            <input type="number" name="revenue" value={inputs.revenue} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                            <label>Precio de tu Producto/Servicio ({inputs.currency})</label>
                            <input type="number" name="ticketPrice" value={inputs.ticketPrice} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Tasa de Conversión en {inputs.objective === 'whatsapp' ? 'Chat' : 'Web'} (%)</label>
                                <input type="number" step="0.1" name="conversionRate" value={inputs.conversionRate} onChange={handleInputChange} className="form-control" />
                                {inputs.objective === 'whatsapp' && (
                                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                                        De cada 100 personas que escriben, ¿cuántas compran? (Promedio 10%-20%)
                                    </small>
                                )}
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label>Costo Por {inputs.objective === 'whatsapp' ? 'Mensaje' : 'Clic'} Estimado ({inputs.currency})</label>
                                <input type="number" step="0.01" name="cpc" value={inputs.cpc} onChange={handleInputChange} className="form-control" />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                            <label>CTR Estimado (%)</label>
                            <input type="number" step="0.1" name="ctr" value={inputs.ctr} onChange={handleInputChange} className="form-control" />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                                El porcentaje de personas que ven tu anuncio y hacen clic.
                            </small>
                        </div>

                        <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Calcular Presupuesto Exacto</button>
                    </form>
                </div>

                {results && (
                    <div className="results-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card glass-panel" style={{ borderColor: 'var(--primary)', borderWidth: '2px', background: 'linear-gradient(145deg, rgba(24,119,242,0.1) 0%, rgba(30,30,40,1) 100%)' }}>
                            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Plan de Inversión Requerido</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Para facturar {new Intl.NumberFormat(results.currency === 'COP' ? 'es-CO' : 'en-US', { style: 'currency', currency: results.currency, maximumFractionDigits: results.currency === 'COP' ? 0 : 2 }).format(inputs.revenue)} necesitas este rendimiento:</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>PRESUPUESTO TOTAL</p>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>{results.formattedBudget}</h3>
                                </div>
                                <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>PRESUPUESTO DIARIO (30d)</p>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>{results.formattedDailyBudget}</h3>
                                </div>
                            </div>

                            <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Tráfico Necesario</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>VENTAS</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.2rem 0' }}>{results.salesNeeded.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase' }}>
                                        {results.objective === 'whatsapp' ? 'LEADS (CHATS)' : 'CLICS (VISITAS)'}
                                    </p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.2rem 0' }}>{results.clicksNeeded.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>IMPRESIONES</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.2rem 0' }}>{results.impressionsNeeded.toLocaleString()}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>ROAS Proyectado: <strong>{results.roas}x</strong></span>
                                <span>CPM Máx Permitido: <strong>{results.formattedCpm}</strong></span>
                            </div>

                            {/* --- Bloque de Interpretación Estratégica --- */}
                            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                    <span>📊</span> Interpretación Estratégica
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Punto de Equilibrio (Break-Even)</h4>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                            Necesitas vender <strong>{results.strats.breakEvenSales} unidades</strong> para recuperar exactamente los {results.formattedBudget} invertidos en Ads (ROAS 1x).
                                        </p>
                                    </div>

                                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>CTR Crítico Mínimo</h4>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                            Si tus anuncios tienen un CTR menor a <strong>{results.strats.minCtr}%</strong>, corres el riesgo de perder dinero (con la conversión actual de {inputs.conversionRate}%).
                                        </p>
                                    </div>

                                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Riesgo: Caída de Conversión (-1%)</h4>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                            Si tu conversión web baja 1%, el presupuesto necesario para llegar a la meta saltaría a <strong>{results.strats.budgetWithCvrDrop}</strong>.
                                        </p>
                                    </div>

                                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Riesgo: Subida de CPM (+50%)</h4>
                                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                            Si Meta encarece las impresiones a {results.strats.cpmRiseFormatted}, tu presupuesto necesario subiría a <strong>{results.strats.budgetWithCpmRise}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BudgetCalculator;
