const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allows specific Vercel domain in prod, falls back to * for dev
    credentials: true
}));
app.use(express.json());

// --- META GRAPH API CONFIGURATION ---
// These will eventually be populated via a database after OAuth. 
// For MVP, if the user provides a Long-lived token in .env, we use it directly.
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_GRAPH_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

// ----------------------------------------------------
// 1. OAUTH ENDPOINTS (Future implementation for SaaS)
// ----------------------------------------------------
app.get('/api/auth/meta/url', (req, res) => {
    // Generates the URL to redirect the user to Facebook Login
    const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL}/api/auth/meta/callback`);
    const authUrl = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=ads_management,ads_read`;
    res.json({ url: authUrl });
});

app.get('/api/auth/meta/callback', async (req, res) => {
    // Handles the callback from Facebook with the 'code'
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const redirectUri = `${process.env.BACKEND_URL}/api/auth/meta/callback`;
        // Exchange code for short-lived token
        const tokenResponse = await axios.get(`${BASE_URL}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&client_secret=${META_APP_SECRET}&code=${code}`);
        const shortToken = tokenResponse.data.access_token;

        // Exchange short for long-lived token
        const longTokenResponse = await axios.get(`${BASE_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortToken}`);
        const longToken = longTokenResponse.data.access_token;

        // TODO: Save longToken to User Database
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Meta Auth Error:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');
    }
});

// ----------------------------------------------------
// 2. DATA FETCHING ENDPOINTS
// ----------------------------------------------------

// Endpoint to fetch the list of Campaigns under the Ad Account
app.post('/api/meta/campaigns', async (req, res) => {
    const { adAccountId, userAccessToken } = req.body || {};
    const token = userAccessToken || process.env.META_DEV_ACCESS_TOKEN;
    const accountId = adAccountId || process.env.TEST_AD_ACCOUNT_ID;

    if (!token || !accountId) {
        return res.status(400).json({ error: 'Missing Access Token or Ad Account ID' });
    }

    try {
        const url = `${BASE_URL}/act_${accountId}/campaigns`;

        // Fetch limits to active/paused reasonably to avoid immense payloads
        const response = await axios.get(url, {
            params: {
                access_token: token,
                fields: 'id,name,status,objective',
                limit: 50
            }
        });

        res.json({ success: true, campaigns: response.data.data });

    } catch (error) {
        console.error('Meta API Campaigns Error:', error.response?.data?.error || error.message);
        res.status(500).json({ error: 'Failed to fetch campaigns.' });
    }
});

// Endpoint to fetch insights by Campaign OR by Account
app.post('/api/meta/insights', async (req, res) => {
    const { adAccountId, userAccessToken, campaignId } = req.body || {};
    // Fallback to Env token if frontend doesn't pass one (ideal for local testing)
    const token = userAccessToken || process.env.META_DEV_ACCESS_TOKEN;
    const accountId = adAccountId || process.env.TEST_AD_ACCOUNT_ID;

    if (!token || !accountId) {
        return res.status(400).json({ error: 'Missing Access Token or Ad Account ID. Configure them in .env or pass them from frontend.' });
    }

    try {
        // Fetch last 30 days of data. Use campaign URL if campaignId exists, else account.
        const baseUrlFragment = campaignId ? `${BASE_URL}/${campaignId}` : `${BASE_URL}/act_${accountId}`;
        const url = `${baseUrlFragment}/insights`;

        // Level parameter dictates the granularity
        const levelParams = campaignId ? 'campaign' : 'account';

        const response = await axios.get(url, {
            params: {
                access_token: token,
                fields: 'cpm,ctr,cpc,spend,actions,cost_per_action_type',
                date_preset: 'last_30d',
                level: levelParams
            }
        });

        const data = response.data.data[0];

        if (!data) {
            return res.json({ message: 'No current ad data found for this period.', raw: [] });
        }

        // Extract Results based on common conversion actions
        let totalResults = 0;
        if (data.actions) {
            // Look for common bottom funnel results
            const resultTypes = ['lead', 'purchase', 'onsite_conversion.lead_grouped', 'messaging_conversation_started_7d', 'subscribe'];
            data.actions.forEach(action => {
                if (resultTypes.includes(action.action_type)) {
                    totalResults += parseFloat(action.value);
                }
            });

            // If no bottom funnel results, fallback to link clicks for traffic campaigns
            if (totalResults === 0) {
                const clickAction = data.actions.find(a => a.action_type === 'link_click');
                if (clickAction) totalResults = parseFloat(clickAction.value);
            }
        }

        const spend = parseFloat(data.spend || 0);
        let cpr = 0;
        if (totalResults > 0) {
            cpr = spend / totalResults;
        }

        // Structure the data to send back to our React Frontend
        const insights = {
            cpm: parseFloat(data.cpm || 0).toFixed(2),
            ctr: parseFloat(data.ctr || 0).toFixed(2),
            cpc: parseFloat(data.cpc || 0).toFixed(2),
            cpr: cpr.toFixed(2),
            results: totalResults.toString(),
            spend: spend.toFixed(2)
        };

        res.json({ success: true, insights });

    } catch (error) {
        console.error('Meta API Error:', error.response?.data?.error || error.message);
        res.status(500).json({
            error: 'Failed to fetch insights from Meta API',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// ----------------------------------------------------
// 3. AI ASSISTANT ENDPOINTS
// ----------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat/analyze', async (req, res) => {
    const { message, metricsContext, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Build the system prompt injecting the context
        let contextString = "No metrics provided yet.";
        if (metricsContext) {
            contextString = `
          Current Campaign Metrics:
          - CPM: $${metricsContext.cpm}
          - CTR: ${metricsContext.ctr}%
          - CPC: $${metricsContext.cpc}
          - Cost per Result: $${metricsContext.cpr}
          - Total Results: ${metricsContext.results}
          - Spend: $${metricsContext.spend}
          - ROAS: ${metricsContext.roas || 'N/A'}
          
          Diagnosis:
          ${JSON.stringify(metricsContext.diagnosis, null, 2)}
          `;
        }

        const systemPrompt = `
      You are "Smarty" 🤖, an expert Media Buyer, Conversion Rate Optimizer, and Marketing Strategist.
      
      Your personality:
      - You are friendly, enthusiastic, and highly empathetic.
      - You use emojis naturally (🚀, 💡, 🔥, etc.) to keep the tone engaging.
      - You explain complex marketing concepts as if the user were a smart 5-year-old, using simple analogies.
      - You are proactive: instead of just giving raw data, you ALWAYS end your responses by asking a clarifying question about their creative, offer, or target audience to keep the conversation flowing.
      
      Your goal is to help the user understand their Meta Ads campaign data and give actionable, high-ROI advice.
      Keep your answers highly concise, direct, and formatted with markdown (bullet points, bold text).
      Do not hallucinate data. Base your advice strictly on the following context about their active campaign:
      
      === CONTEXT START ===
      ${contextString}
      === CONTEXT END ===
      `;

        // Map the history format for Gemini
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Start the chat session
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "¡Entendido! Soy Smarty 🤖, tu Media Buyer personal. Estoy listo para analizar tus campañas de Meta Ads de forma amigable y darte los mejores consejos. ¡Vamos a escalar juntos! 🚀" }] },
                ...formattedHistory
            ]
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ success: true, reply: responseText });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate AI response.' });
    }
});

app.post('/api/chat/refine-copy', async (req, res) => {
    const { message, copyContext, history } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let contextString = "No copy generated yet.";
        if (copyContext) {
            contextString = `
            Niche: ${copyContext.inputs?.niche}
            Product: ${copyContext.inputs?.product}
            Target Audience: ${copyContext.inputs?.audience}
            Objective: ${copyContext.inputs?.objective}
            
            Recently Generated Assets: 
            ${JSON.stringify(copyContext.outputs?.angles || [], null, 2)}
            `;
        }


        const systemPrompt = `
        You are "Smarty" 🤖, an expert Direct Response Copywriter.
        
        Your personality is friendly, enthusiastic, and highly professional. Use emojis naturally.
        Your goal is to help the user refine, translate, or rewrite the ad copies you just generated for them.
        Keep answers highly concise and ready to copy-paste.
        
        Base your context on the following recently generated assets:
        === CONTEXT START ===
        ${contextString}
        === CONTEXT END ===
        `;

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "¡Hola! Soy Smarty 🤖. Acabo de generar tus activos publicitarios. ¿Qué ángulo te gustaría que ajustemos, traduzcamos o hagamos más agresivo? 🚀" }] },
                ...formattedHistory
            ]
        });

        const result = await chat.sendMessage(message);
        res.json({ success: true, reply: result.response.text() });

    } catch (error) {
        console.error('Gemini API Refine Error:', error);
        res.status(500).json({ error: 'Failed to refine AI copy.' });
    }
});

// Endpoint for refining/chatting about Campaign Structures
app.post('/api/chat/refine-structure', async (req, res) => {
    const { message, structureContext, history } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let contextString = "No structure generated yet.";
        if (structureContext) {
            contextString = `
            User Inputs:
            Objective: ${structureContext.inputs?.objective}
            Budget: ${structureContext.inputs?.budget} ${structureContext.inputs?.currency}
            Experience Level: ${structureContext.inputs?.knowledge}
            Phase: ${structureContext.inputs?.phase}
            
            Generated Architecture: 
            ${JSON.stringify(structureContext.outputs, null, 2)}
            `;
        }

        const systemPrompt = `
        You are "Smarty" 🤖, an expert Media Buyer and Campaign Strategist.
        
        Your personality is friendly, enthusiastic, and highly professional. Use emojis naturally.
        Your goal is to explain, justify, or tweak the campaign architecture that was just generated for the user.
        Keep answers concise, strategic, and easy to understand. Tell them exactly WHY certain budgets are allocated this way, or WHY a certain phase requires this structure.
        
        Base your context on the following recently generated architecture:
        === CONTEXT START ===
        ${contextString}
        === CONTEXT END ===
        `;

        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "¡Hola! Soy Smarty 🤖, tu Media Buyer virtual. Acabo de diseñar esta estructura basándome en tu presupuesto y fase actual. ¿Tienes dudas sobre los porcentajes, la segmentación o cómo distribuirlo? ¡Pregúntame! 💸" }] },
                ...formattedHistory
            ]
        });

        const result = await chat.sendMessage(message);
        res.json({ success: true, reply: result.response.text() });

    } catch (error) {
        console.error('Gemini API Structure Refine Error:', error);
        res.status(500).json({ error: 'Failed to refine AI structure.' });
    }
});

app.post('/api/chat/generate-copy', async (req, res) => {
    const { niche, product, ticket, audience, painPoint, objective, demographics, benefits, differentiation, objections, guarantee } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Act as a world-class Direct Response Copywriter for Meta Ads.
        Based on the following deep psychological inputs, generate magnetic, high-converting ad copy:
        Niche: ${niche}
        Product: ${product}
        Price: ${ticket}
        Target Audience Description: ${audience}
        Audience Demographics: ${demographics}
        Biggest Pain Point / Problems: ${painPoint}
        Solutions & Benefits we offer: ${benefits}
        Unique Differentiation (Why choose us?): ${differentiation}
        Main Objections to Overcome: ${objections}
        Product Guarantee: ${guarantee}
        Campaign Objective: ${objective}

        You MUST generate EXACTLY 20 distinct medium-to-long ad copies (2 to 3 paragraphs each to be more detailed and persuasive), each focusing on one of the following psychological sales angles:
        1. Resultado / Transformación
        2. Dolor / Problema
        3. Deseo / Aspiración
        4. Rapidez
        5. Ahorro (dinero)
        6. Educación / Autoridad
        7. Descubrimiento / Secreto
        8. Seguridad / Confianza
        9. Prueba Social
        10. Comparación
        11. Evitar error
        12. Comodidad / Facilidad
        13. Oferta / Escasez
        14. Exclusividad
        15. Sistema / Método
        16. Contexto local
        17. Prevención
        18. Innovación
        19. Simplicidad
        20. Identidad

        Return ONLY a valid, parseable JSON object with the following exact structure, with no markdown formatting, no backticks, and no extra text:
        {
          "angles": [
            { "name": "Resultado / Transformación", "copy": "..." },
            { "name": "Dolor / Problema", "copy": "..." },
            ... (include ALL 20 angles in order)
          ],
          "hooks": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"],
          "scripts": ["video script 1", "video script 2"],
          "ctas": ["call to action 1", "call to action 2", "call to action 3"]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // Ensure no markdown block wrapping
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsedJson = JSON.parse(responseText);
        res.json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('Gemini API Copy Error:', error);
        res.status(500).json({ error: 'Failed to generate AI copy.' });
    }
});

app.post('/api/chat/generate-manychat-flow', async (req, res) => {
    const { objective, niche, product, tone } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Actúa como un Experto en Chat Marketing y Arquitecto de embudos de ManyChat para Instagram/Facebook.
        Crea un flujo de conversación persuasivo, natural y de alta conversión.

        Objetivo de la Campaña: ${objective}
        Nicho de Negocio: ${niche}
        Producto Principal: ${product}
        Tono de Conversación: ${tone}

        Diseña un árbol de conversación que comience desde que el usuario interactúa con un anuncio o envía un DM con una palabra clave.

        Return ONLY a valid, parseable JSON object with the exact following structure, with no markdown formatting and no extra text at all. 
        MANDATORY: Make sure "nodes" array covers the full path, always starting with id "node-1".
        {
          "title": "Nombre del Flujo (ej. Captación Inmobiliaria)",
          "trigger": "Disparador que inicia este flujo (ej. Usuario comenta 'PRECIO' o envía 'INFO' al DM)",
          "strategyRationale": "Explica brevemente por qué estructuraste el embudo de esta manera.",
          "nodes": [
            {
              "id": "node-1",
              "type": "message", // type can be "message", "collect_data", or "action"
              "text": "¡Hola! Vi que te interesa [producto]... ¿Qué es lo que más te llama la atención?",
              "options": [
                { "text": "Opción 1", "nextId": "node-2" },
                { "text": "Opción 2", "nextId": "node-3" }
              ]
            },
            {
              "id": "node-2",
              "type": "collect_data",
              "text": "Genial. Déjame tu WhatsApp para enviarte más detalles:",
              "options": [
                { "text": "Enviar Número", "nextId": "node-4" }
              ]
            },
            {
              "id": "node-4",
              "type": "action",
              "text": "[INTERNAL ACTION: Etiquetar como Lead Caliente y notificar a Ventas en Slack/Email]",
              "options": []
            }
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // Ensure no markdown block wrapping
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsedJson = JSON.parse(responseText);
        res.json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('Gemini API ManyChat Error:', error);
        res.status(500).json({ error: 'Failed to generate ManyChat flow.' });
    }
});

app.post('/api/chat/business-coach', async (req, res) => {
    let { message } = req.body;
    const { profileContext, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        // Construct system persona and inject the user's persistent business context
        let systemPrompt = `
        Actúa como un 'Elite Business Coach y Project Manager' especializado en dueños de agencias, freelancers y creadores de contenido.
        Tu nombre es Smarty Coach. Eres experto en estructurar negocios, cobrar High Ticket, escalar operaciones, diseñar ofertas irresistibles y armar hojas de ruta (Roadmaps).
        Tu tono debe ser profesional, empático, directo ('sin pelos en la lengua') y súper accionable. No des respuestas genéricas; da el "paso a paso" exacto.
        `;

        if (profileContext) {
            systemPrompt += `\n
        ========================================
        CONTEXTO ACTUAL DEL NEGOCIO DEL CLIENTE:
        - Nicho / Industria: ${profileContext.niche || 'No definido'}
        - Cliente Ideal (Avatar): ${profileContext.avatar || 'No definido'}
        - Oferta / Servicio Principal: ${profileContext.offer || 'No definido'}
        - Nivel de Facturación Actual: ${profileContext.revenue || 'No definido'}
        - Meta Principal a Corto Plazo: ${profileContext.goal || 'No definido'}
        - Cuello de Botella Actual: ${profileContext.bottleneck || 'No definido'}
        ========================================
        Usa ESTE CONTEXTO en todas tus respuestas para dar consejos hiper-personalizados. Si te piden estrategias de precios, considera su nicho y facturación. Si te piden un plan, enfócalo en su meta principal y ataca su cuello de botella.
        `;
        }

        // Convert frontend history to Gemini format, ensuring strict user -> model -> user alternation
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            let currentRole = null;
            let currentText = [];

            for (const msg of history) {
                const role = msg.role === 'user' ? 'user' : 'model';

                if (role !== currentRole) {
                    // Save previous block if exists
                    if (currentRole !== null) {
                        formattedHistory.push({ role: currentRole, parts: [{ text: currentText.join('\n\n') }] });
                    }
                    currentRole = role;
                    currentText = [msg.content];
                } else {
                    // Append to current block
                    currentText.push(msg.content);
                }
            }
            // Push the last block
            if (currentRole !== null) {
                formattedHistory.push({ role: currentRole, parts: [{ text: currentText.join('\n\n') }] });
            }
        }

        // Gemini SDK REQUIREMENT: History passed to startChat MUST end with 'model' 
        // because chat.sendMessage() will append a 'user' message. 
        // If it ends with 'user', we must pop it and prepend it to the incoming message.
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
            const lastUserMsg = formattedHistory.pop();
            message = lastUserMsg.parts[0].text + '\n\n' + message;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: formattedHistory
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        res.json({ success: true, reply: text });

    } catch (error) {
        console.error('Gemini API Business Coach Error:', error);
        res.status(500).json({ error: 'Failed to process coach message.', details: error.message || error.toString() });
    }
});

app.post('/api/chat/generate-organic', async (req, res) => {
    const { niche, audience, profile, pillars, objective } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Actúa como un estratega experto en Marca Personal y Creación de Contenido Viral (TikTok, Instagram Reels, LinkedIn).
        Tu objetivo es generar un calendario/ideas de contenido de altísimo valor basado en estos pilares de la marca personal:
        
        Nicho/Mercado: ${niche}
        Audiencia Objetivo: ${audience}
        Perfil/Autoridad del Creador: ${profile}
        Temas Principales o Pilares de Contenido: ${pillars}
        Objetivo Principal del Contenido: ${objective}

        Debes crear contenido que sea magnético, que eduque y posicione al creador como una autoridad indiscutible. No es contenido de venta directa (anuncios), sino contenido orgánico para nutrir a la audiencia y volverse viral.

        Return ONLY a valid, parseable JSON object with the exact following structure, with no markdown formatting and no extra text:
        {
          "viralHooks": ["hook text 1", "hook text 2", ... (genera exactamente 10 ideas de ganchos (títulos) virales cortos y provocativos)],
          "videoScripts": [
             // Genera exactamente 5 guiones estructurados para Reels/TikToks de 60 segundos
            { 
              "title": "Nombre de la idea",
              "hook": "Las primeras 3 palabras magnéticas para retener la atención",
              "body": "El script exacto que deben decir a la cámara aportando valor real",
              "cta": "Llamado a la acción (ej. Sígueme, comenta la palabra X)"
            },
            ...
          ],
          "carouselOutlines": [
             // Genera exactamente 3 estructuras completas para Carruseles educativos de Instagram/LinkedIn (5 a 8 láminas cada uno)
            {
              "title": "Nombre del carrusel",
              "slides": ["Lámina 1 (Portada): ...", "Lámina 2: ...", "Lámina 3: ...", "Lámina Final (CTA): ..."]
            },
            ...
          ]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // Ensure no markdown block wrapping
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsedJson = JSON.parse(responseText);
        res.json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('Gemini API Organic Copy Error:', error);
        res.status(500).json({ error: 'Failed to generate Organic AI copy.' });
    }
});

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer for image uploads (Store temporarily)
const upload = multer({ dest: 'uploads/' });

// Helper to convert local file to Google AI format
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType,
        },
    };
}

app.post('/api/vision/analyze-ad', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const { productContext } = req.body;

        // Use the gemini-1.5-pro model since vision in 2.5-flash might not be completely stable for all formats yet, but 1.5-pro is excellent for analysis.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

        const prompt = `
        Actúa como un Media Buyer Senior y experto en Ingeniería Inversa publicitaria.
        Analiza esta imagen (que es un anuncio ganador de la competencia).

        Contexto adicional (Mi producto o nicho): ${productContext || 'No especificado, infiere el nicho del propio anuncio.'}

        Desmitifica el anuncio y extrae su fórmula secreta.
        
        Return ONLY a valid, parseable JSON object with the exact following structure, with no markdown formatting and no extra text at all:
        {
          "psychology": "Explica en 2-3 líneas el ángulo psicológico profundo que están atacando (ej. estatus, miedo a perder tiempo, ahorro, validación social).",
          "hookVisual": "Describe qué elemento visual están usando para detener el scroll (colores, texto gigante, rostros, etc).",
          "hookTextual": "Transcribe o resume la primera frase/gancho textual del anuncio.",
          "offer": "Cuál es la oferta irresistible o llamado a la acción principal que detectas.",
          "replicationFramework": [
            "Paso 1: Adapta el gancho...",
            "Paso 2: Usa esta estructura para tu producto...",
            "Paso 3: ...",
            "Paso 4: ..."
          ],
          "suggestedCopy": "Escribe un ejemplo de copy para MI producto aplicando la misma psicología de este anuncio."
        }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text();

        // Clean up the temporary file
        fs.unlinkSync(req.file.path);

        // Ensure no markdown block wrapping
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsedJson = JSON.parse(responseText);
        res.json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('Gemini API Vision Error:', error);
        // Clean up even on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to analyze the ad image.', details: error.message || error.toString() });
    }
});

app.post('/api/chat/generate-report', async (req, res) => {
    console.log("--> [DEBUG] /api/chat/generate-report HIT");
    try {
        const { clientName, timeframe, objective, metricsExtracted } = req.body;

        console.log("--> [DEBUG] Body parsed:", { clientName, timeframe, objective, metricsExtracted });

        if (!metricsExtracted) {
            console.log("--> [DEBUG] Missing metrics");
            return res.status(400).json({ error: 'Faltan métricas para analizar.' });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Actúa como un Analista de Marketing y Trafficker Senior.
        Vas a analizar los datos duros extraídos directamente desde la API de Meta Ads de la campaña de un cliente.
        
        Contexto del reporte:
        Cliente/Marca: ${clientName || 'No especificado'}
        Periodo: ${timeframe || 'Últimos 30 días'}
        Objetivo de la Campaña: ${objective || 'No especificado'}

        Métricas Reales Obtenidas:
        - Inversión Total: $${metricsExtracted.spend}
        - Resultados Totales: ${metricsExtracted.results}
        - Costo por Resultado (CPA): $${metricsExtracted.cpr}
        - CTR: ${metricsExtracted.ctr}%
        - CPC: $${metricsExtracted.cpc}
        - CPM: $${metricsExtracted.cpm}

        Tu tarea es:
        Redactar un reporte de desempeño analizando esos números en base al objetivo. No repitas los números de forma aburrida. Analiza si el CTR es bueno, si el CPM es caro, si el Costo por Resultado es rentable. Tienes que sonar como un profesional estratégico de Performance Marketing que le habla a su cliente dueño de negocio.
        
        Return ONLY a valid, parseable JSON object with the exact following structure, with no markdown formatting and no extra text at all:
        {
          "resumenEjecutivo": "Un párrafo empático y directo resumiendo el desempeño general hacia el objetivo (ej. 'Este mes aseguramos X resultados con una excelente tasa de conversión...').",
          "puntosPositivos": ["Punto positivo 1 basado puramente en los datos", "Punto positivo 2"],
          "oportunidadesMejora": ["Oportunidad de mejora estratégica 1", "Oportunidad de mejora 2"]
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // Ensure no markdown block wrapping
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsedJson = JSON.parse(responseText);
        res.json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('Gemini API Generate Report Error:', error);
        res.status(500).json({ error: 'Failed to generate the metrics analytical report.', details: error.message || error.toString() });
    }
});

app.post('/api/chat/sales-assistant', async (req, res) => {
    const { trainingContext, history } = req.body;

    if (!trainingContext || !history) {
        return res.status(400).json({ error: 'Missing training context or chat history.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct system persona and inject the user's specific product context
        let systemPrompt = `
        ACTÚA COMO UN VENDEDOR ESTRELLA MUY PERSUASIVO. Tu nombre NO ES una IA, eres el representante oficial de este negocio.
        TU OBJETIVO ES RESPONDER A UN CLIENTE/PROSPECTO QUE ESTÁ INTERESADO O TIENE DUDAS SOBRE TU OFERTA.
        NO TE SALGAS DE TU ROL BAJO NINGUNA CIRCUNSTANCIA.

        ======= INSTRUCCIONES ESTRICTAS DEL NEGOCIO (TU CEREBRO) =======
        - Producto(s) o Servicio(s) que vendes: ${trainingContext.product}
        - Rango de Precios Oficial (NUNCA INVENTES OTROS PRECIOS): ${trainingContext.price || 'No especificado'}
        - Nicho del negocio: ${trainingContext.niche}
        - Audiencia (A quién le hablas): ${trainingContext.demographics} ${trainingContext.audienceDesc}
        - Diferenciador Principal (Úsalo para presumir sutilmente): ${trainingContext.differentiation}
        - El problema actual del cliente es: ${trainingContext.painPoint}
        - Tu solución exacta y beneficios: ${trainingContext.benefits}
        - Qué garantía ofreces: ${trainingContext.guarantee}
        - TIPO DE VENDEDOR QUE ERES: ${trainingContext.salesRole}
        - TONO, CULTURA Y PERSONALIDAD: ${trainingContext.tone}

        ======= OBJECIONES FRECUENTES A RESOLVER SI TE LAS MENCIONAN =======
        ${trainingContext.objections}

        ======= REGLAS DE RESPUESTA =======
        - Respóndele SOLO lo que el cliente preguntó, no vomites toda la información de golpe.
        - Haz preguntas al final de tus mensajes para guiar el cierre (ej. "¿Te gustaría empezar hoy?").
        - Trata al prospecto con respeto pero siendo persuasivo según tu tono configurado.
        - Mantén los mensajes de longitud razonable para un chat o DM.
        - NUNCA menciones que todo esto es un contexto que te acaban de inyectar, compórtate de forma nativa.
        `;

        // We convert the accumulated frontend chat history into Gemini format
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            let currentRole = null;
            let currentText = [];

            for (const msg of history) {
                const role = msg.role === 'user' ? 'user' : 'model';

                if (role !== currentRole) {
                    if (currentRole !== null) {
                        formattedHistory.push({ role: currentRole, parts: [{ text: currentText.join('\\n\\n') }] });
                    }
                    currentRole = role;
                    currentText = [msg.text];
                } else {
                    currentText.push(msg.text);
                }
            }
            if (currentRole !== null) {
                formattedHistory.push({ role: currentRole, parts: [{ text: currentText.join('\\n\\n') }] });
            }
        }

        // Pop the last message to send it as the prompt
        let finalMessage = "";
        let chatContext = [];

        if (formattedHistory.length > 0) {
            const lastItem = formattedHistory.pop();
            finalMessage = lastItem.parts[0].text;
            chatContext = formattedHistory;
        }

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Entendido, soy el vendedor estrella. A partir de ahora solo actuaré bajo estos parámetros y en personaje. Adelante." }] },
                ...chatContext
            ]
        });

        const result = await chat.sendMessage(finalMessage);

        // This endpoint expects a raw string reply, not JSON
        res.json({ success: true, reply: result.response.text() });

    } catch (error) {
        console.error('Gemini API Sales Assistant Error:', error);
        res.status(500).json({ error: 'Failed to simulate sales response.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Smart Ads Backend running on http://localhost:${PORT}`);
});

