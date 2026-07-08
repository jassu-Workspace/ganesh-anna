// services/claudeService.js
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'tencent/hy3:free';

/**
 * Calls OpenRouter with a system prompt + user message and returns the plain text reply.
 * @param {string} system - system prompt describing the assistant's role
 * @param {string} userText - the user's message / task
 * @param {number} maxTokens
 */
async function askClaude(system, userText, maxTokens = 1024) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'VoyageAI',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userText }
      ]
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(`OpenRouter request failed (${response.status}): ${message}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part.text || ''))
      .join('\n')
      .trim();
  }

  return String(content || '').trim();
}

/**
 * Calls OpenRouter and expects a strict JSON object back. Strips markdown fences defensively
 * and throws if no JSON object can be found.
 */
async function askClaudeForJSON(system, userText, maxTokens = 1024) {
  const raw = await askClaude(
    system + ' Respond with ONLY valid JSON. No markdown fences, no commentary before or after.',
    userText,
    maxTokens
  );
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('OpenRouter did not return parseable JSON: ' + raw.slice(0, 200));
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

module.exports = { askClaude, askClaudeForJSON, MODEL };
