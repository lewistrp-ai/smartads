// Genera el carrusel "Anuncios en Meta Ads con Claude" (1080x1350) en PNG.
// Uso: node build.cjs <claude.path> <meta.path>
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [claudePath, metaPath] = process.argv.slice(2).map(p => fs.readFileSync(p, 'utf8').trim());
const OUT = __dirname;
const HANDLE = '@lewispinedadigital';
const thumb = fs.readFileSync(path.join(__dirname, 'miniatura-tutorial.png')).toString('base64');

const claudeLogo = (s, c = '#D97757') =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="${c}" d="${claudePath}"/></svg>`;
const metaLogo = (s, c = '#0866FF') =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="${c}" d="${metaPath}"/></svg>`;
const logos = s => `<div class="logos">${claudeLogo(s)}<span class="x">×</span>${metaLogo(s)}</div>`;

const prompt = text => `<div class="prompt"><div class="prompt-head"><span class="dot"></span>Prompt para Claude</div><p>${text}</p></div>`;

const slides = [
  // 1. Portada
  `<div class="cover">
     <div class="cover-logos">${claudeLogo(150)}<span class="x big">×</span>${metaLogo(170)}</div>
     <h1>Cómo crear anuncios<br>de <span class="o">Meta Ads</span><br>con <span class="c">Claude</span></h1>
     <p class="lead">6 pasos + los prompts exactos que uso.</p>
     <div class="pill">Guárdalo para tu próxima campaña</div>
   </div>`,
  // 2. Problema
  `<div class="kicker">El problema</div>
   <h2>Armar una campaña te come <span class="c">horas</span></h2>
   <ul class="pain">
     <li><b>✕</b> Escribir copies desde cero</li>
     <li><b>✕</b> Pensar ángulos que no suenen igual</li>
     <li><b>✕</b> Ideas para el creativo</li>
     <li><b>✕</b> Leer métricas sin saber qué hacer</li>
   </ul>
   <div class="callout"><b>La solución:</b> Claude te hace el borrador.<br>Tú tomas las decisiones.</div>`,
  // 3. Paso 1
  `<div class="step">Paso 01</div>
   <h2>Dale <span class="c">contexto</span></h2>
   ${prompt(`Actúa como media buyer experto en Meta Ads.<br><br>
     Mi negocio: <em>[qué vendes]</em><br>
     Cliente ideal: <em>[edad, ciudad, su dolor]</em><br>
     Oferta: <em>[precio, garantía, bono]</em><br>
     Objetivo: <em>[mensajes a WhatsApp / ventas]</em><br><br>
     Si te falta información, pregúntame antes de escribir.`)}
   <p class="tip">Entre más contexto le das, menos genérico suena.</p>`,
  // 4. Paso 2
  `<div class="step">Paso 02</div>
   <h2>Pide <span class="c">ángulos</span>, no copies</h2>
   ${prompt(`Dame 10 ángulos de venta diferentes: dolor, deseo, objeción, comparación y prueba social.<br><br>
     Para cada uno escribe un gancho de máximo 8&nbsp;palabras.`)}
   <p class="tip">Un buen ángulo vale más que un copy bonito. Escoge los 3 que más te pegan.</p>`,
  // 5. Paso 3
  `<div class="step">Paso 03</div>
   <h2>Copies <span class="c">listos para pegar</span></h2>
   ${prompt(`Con estos 3 ángulos escribe 3 variaciones de cada uno:<br><br>
     • Texto principal (gancho en los primeros 125 caracteres)<br>
     • Título (máx. 40 caracteres)<br>
     • Descripción (máx. 30 caracteres)<br><br>
     Tono cercano, español de Colombia.`)}
   <p class="tip">Así salen con el formato exacto que pide el Administrador de anuncios.</p>`,
  // 6. Paso 4
  `<div class="step">Paso 04</div>
   <h2>Ideas para el <span class="c">creativo</span></h2>
   ${prompt(`Para cada ángulo dame:<br><br>
     1. Un guion de reel de 15 segundos: gancho (0-3&nbsp;s), desarrollo y llamado a la acción.<br>
     2. Una idea de imagen estática con el texto exacto que va encima.`)}
   <p class="tip">Grabas tú, pero ya sabes qué decir y qué mostrar.</p>`,
  // 7. Paso 5
  `<div class="step blue">Paso 05</div>
   <h2>Súbelo a <span class="o">Meta</span></h2>
   <p class="body">Conecta Claude a tu cuenta de Meta Ads y pídele:</p>
   ${prompt(`Crea una campaña de <em>[objetivo]</em> con estos 3 anuncios, presupuesto de <em>[$ diario]</em> y público <em>[segmentación]</em>.<br><br>
     <b>Déjala en pausa.</b>`)}
   <div class="warn"><b>Regla de oro:</b> siempre en pausa. Revisa presupuesto, público y creativos antes de activar.</div>`,
  // 8. Paso 6
  `<div class="step blue">Paso 06</div>
   <h2>Analiza y <span class="o">optimiza</span></h2>
   ${prompt(`Revisa mis campañas de los últimos 7 días.<br><br>
     Dame CTR, CPC y costo por resultado de cada anuncio. ¿Cuál pauso, cuál escalo y por qué?`)}
   <p class="tip">Claude lee los números. Tú decides dónde va la plata.</p>`,
  // 9. CTA
  `<div class="cta">
     <h2>¿Quieres el <span class="c">paso a paso</span> completo?</h2>
     <div class="video"><img src="data:image/png;base64,${thumb}"><span class="play">▶</span></div>
     <div class="cta-row"><span class="lead">Comenta</span><div class="keyword">CLAUDE</div></div>
     <p class="lead">y te envío el tutorial para crear tu campaña<br>en <span class="o">Meta</span> con <span class="c">Claude</span> desde cero.</p>
   </div>`,
];

const total = slides.length;
const pad = n => String(n).padStart(2, '0');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
:root{--bg:#141413;--card:#1F1E1C;--line:#34322E;--text:#F5F2EA;--muted:#A8A39A;--c:#D97757;--o:#3D8BFF}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000;font-family:Inter,sans-serif;color:var(--text)}
.slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:var(--bg);padding:120px 96px 150px;display:flex;flex-direction:column;justify-content:center}
.slide::before{content:"";position:absolute;width:900px;height:900px;border-radius:50%;right:-380px;top:-380px;background:radial-gradient(circle,rgba(217,119,87,.22),transparent 65%)}
.slide::after{content:"";position:absolute;width:900px;height:900px;border-radius:50%;left:-420px;bottom:-460px;background:radial-gradient(circle,rgba(8,102,255,.18),transparent 65%)}
.slide>*{position:relative;z-index:1}
.top{position:absolute;top:56px;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center;z-index:2}
.bottom{position:absolute;bottom:56px;left:96px;right:96px;display:flex;justify-content:space-between;align-items:center;font-size:26px;color:var(--muted);z-index:2}
.bottom .swipe{color:var(--text);font-weight:600}
.count{font-family:'JetBrains Mono';font-size:24px;color:var(--muted)}
.logos{display:flex;align-items:center;gap:18px}
.x{font-size:34px;color:var(--muted);font-weight:300}
.x.big{font-size:90px}
h1{font-family:'Inter Display';font-weight:900;font-size:104px;line-height:1.02;letter-spacing:-2px}
h2{font-family:'Inter Display';font-weight:800;font-size:78px;line-height:1.05;letter-spacing:-1.5px;margin-bottom:44px}
.c{color:var(--c)} .o{color:var(--o)}
.lead{font-size:38px;color:var(--muted);margin-top:36px;line-height:1.35}
.pill{display:inline-block;margin-top:52px;padding:20px 34px;border:2px solid var(--line);border-radius:999px;font-size:28px;font-weight:600;align-self:flex-start}
.cover-logos{display:flex;align-items:center;gap:40px;margin-bottom:72px}
.kicker,.step{font-family:'JetBrains Mono';font-weight:700;font-size:28px;letter-spacing:2px;text-transform:uppercase;color:var(--c);margin-bottom:24px}
.step.blue{color:var(--o)}
.prompt{background:var(--card);border:2px solid var(--line);border-left:8px solid var(--c);border-radius:28px;padding:44px 48px}
.prompt-head{display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono';font-size:22px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:24px}
.dot{width:14px;height:14px;border-radius:50%;background:var(--c)}
.prompt p{font-size:34px;line-height:1.42}
.prompt em{color:var(--c);font-style:normal;font-weight:600}
.tip{margin-top:40px;font-size:32px;line-height:1.4;color:var(--muted)}
.body{font-size:34px;color:var(--muted);margin:-16px 0 32px}
.pain{list-style:none;display:flex;flex-direction:column;gap:26px}
.pain li{font-size:40px;font-weight:500;display:flex;gap:24px;align-items:center}
.pain b{color:var(--c);font-size:34px}
.callout{margin-top:60px;background:var(--c);color:#141413;border-radius:28px;padding:40px 44px;font-size:38px;line-height:1.35;font-weight:500}
.warn{margin-top:36px;border:2px solid var(--o);background:rgba(8,102,255,.12);border-radius:24px;padding:30px 36px;font-size:30px;line-height:1.4}
.cta{display:flex;flex-direction:column;align-items:center;text-align:center}
.cta .logos{margin-bottom:56px}
.cta .x{font-size:54px}
.cta h2{margin-bottom:0}
.cta .pill{align-self:center}
.keyword{margin-top:24px;font-family:'Inter Display';font-weight:900;font-size:140px;letter-spacing:4px;color:#141413;background:var(--c);padding:6px 56px;border-radius:32px}
.cta .lead{margin-top:24px}
.cta h2{font-size:68px}
.video{position:relative;width:888px;height:500px;margin-top:48px;border-radius:28px;overflow:hidden;border:3px solid var(--line);box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(8,102,255,.25)}
.video img{width:100%;height:100%;object-fit:cover;display:block}
.play{position:absolute;right:26px;bottom:26px;width:96px;height:96px;border-radius:50%;background:rgba(217,119,87,.95);color:#fff;font-size:42px;display:flex;align-items:center;justify-content:center;padding-left:10px;box-shadow:0 10px 40px rgba(0,0,0,.5)}
.tag{position:absolute;top:22px;left:22px;background:#141413;color:var(--text);font-family:'JetBrains Mono';font-size:22px;letter-spacing:2px;text-transform:uppercase;padding:10px 18px;border-radius:12px}
.cta-row{display:flex;align-items:center;gap:28px;margin-top:48px}
.cta-row .lead{margin:0;font-size:44px;color:var(--text);font-weight:600}
.cta-row .keyword{margin:0;font-size:100px;padding:4px 40px}
</style></head><body>
${slides.map((s, i) => `<section class="slide" id="s${i + 1}">
  ${i === 0 ? '' : `<div class="top">${logos(44)}<span class="count">${pad(i + 1)}/${pad(total)}</span></div>`}
  ${s}
  <div class="bottom"><span>${HANDLE}</span>${i < total - 1 ? '<span class="swipe">Desliza →</span>' : ''}</div>
</section>`).join('\n')}
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(OUT, 'carrusel.html'), html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  for (let i = 1; i <= total; i++) {
    await page.locator(`#s${i}`).screenshot({ path: path.join(OUT, `slide-${pad(i)}.png`) });
  }
  await browser.close();
  console.log(`${total} slides listos en ${OUT}`);
})();
