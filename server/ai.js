// Claude helpers shared by every AI endpoint.
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

// Converts the frontend chat history ({ role: 'user' | 'ai' | 'model', content | text })
// into Claude messages. Claude requires the first message to come from the user,
// so leading assistant greetings are dropped.
function toClaudeMessages(history = [], nextUserMessage) {
    const messages = [];
    for (const msg of Array.isArray(history) ? history : []) {
        const text = msg.content ?? msg.text;
        if (!text) continue;
        const role = msg.role === 'user' ? 'user' : 'assistant';
        if (messages.length === 0 && role === 'assistant') continue;
        messages.push({ role, content: String(text) });
    }
    if (nextUserMessage) messages.push({ role: 'user', content: String(nextUserMessage) });
    // The conversation must end on a user turn for Claude to answer it.
    while (messages.length && messages[messages.length - 1].role === 'assistant') messages.pop();
    return messages;
}

async function callClaude({ system, messages, maxTokens = 16000, effort = 'medium' }) {
    const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages,
        output_config: { effort },
        // If Claude declines a request, the API retries it on a fallback model automatically.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === 'refusal') {
        throw new Error('Claude declined this request.');
    }
    const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim();
    if (!text) throw new Error('Claude returned an empty response.');
    return { text, truncated: message.stop_reason === 'max_tokens' };
}

// Free-form chat reply.
async function chat({ system, history, message, maxTokens, effort = 'low' }) {
    const messages = toClaudeMessages(history, message);
    if (messages.length === 0) throw new Error('No user message to answer.');
    const { text } = await callClaude({ system, messages, maxTokens, effort });
    return text;
}

// Extracts the JSON object from a model reply (tolerates ```json fences or stray text).
function parseJsonReply(text) {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
        throw new Error('The AI response was not valid JSON.');
    }
}

const JSON_SYSTEM =
    'Respondes únicamente con un objeto JSON válido, sin markdown, sin bloques de código y sin texto adicional. ' +
    'Escribe todo el contenido en español salvo que se pida otro idioma.';

// Generates a JSON object. `content` can be a string or an array of content blocks (e.g. image + text).
async function generateJson({ prompt, content, maxTokens = 16000, effort = 'medium' }) {
    const userContent = content || prompt;
    const { text, truncated } = await callClaude({
        system: JSON_SYSTEM,
        messages: [{ role: 'user', content: userContent }],
        maxTokens,
        effort,
    });
    if (truncated) throw new Error('The AI response was cut off before finishing.');
    return parseJsonReply(text);
}

module.exports = { chat, generateJson, MODEL };
