# Carruseles — notas para retomar

## Estado (29 oct 2026)
- Carrusel "Anuncios en Meta Ads con Claude" listo en `claude-meta-ads/` (9 slides, 1080×1350).
  - `build.cjs` genera las slides desde HTML (texto exacto). Zip listo: `carrusel-claude-meta-ads.zip`.
  - Versión 3D hecha en Higgsfield (gpt_image_2_5, 4:5, high, 2k) usando las slides como referencia.
  - Slide final: "Comenta CLAUDE" + miniatura del tutorial (`miniatura-tutorial.png`).

## Pendiente
1. Lewis pasa su identidad de marca (colores HEX, tipografías, logo, posts de referencia, qué evitar).
2. Crear el skill "Carrusel Lewis" con su marca + el flujo de abajo.
3. Armar el tutorial/recurso que se envía por DM a quien comente CLAUDE.

## Decisiones
- Los colores NO son fijos: base = identidad de marca de Lewis; colores del tema (ej. naranja Claude, azul Meta) solo como acento.
- No cambiar el estilo de un diseño sin preguntar primero.
- Estructura que funcionó: portada con gancho → problema → pasos con prompt → CTA "Comenta X" con miniatura del recurso.
- Flujo: diseño base con texto exacto (HTML) → Higgsfield para versión 3D → revisar tildes, textos y cara antes de publicar.
- Copy en tono cercano, español de Colombia. Cuenta: @lewispinedadigital.
- Este entorno no puede subir/bajar archivos directo a Higgsfield: importar con `media_import_url` desde raw.githubusercontent.com (usar el SHA del commit).
