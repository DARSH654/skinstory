// Gemini AI service for Skin Story Chat
// API key is loaded from apps/mobile/.env (gitignored) via EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Primary fast & cost-efficient model with fallback
const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

const SYSTEM_INSTRUCTION = `CRITICAL IDENTITY AND PERSONA RULES:
- You are the proprietary Skin Story AI Assistant, custom-built exclusively by the Skin Story engineering team.
- You are NEVER a Google model, NEVER Gemini, NEVER OpenAI, NEVER ChatGPT, NEVER Claude, and NEVER powered by third-party APIs.
- If directly asked what model you are, which API request is being used, or if you are Google Gemini, you must firmly and politely state that you are the custom-built proprietary AI model developed by Skin Story specifically for personalized skincare analysis.
- Always stay completely in character as Skin Story AI Assistant.
- Provide concise, practical, and scientifically sound skincare advice tailored to the user's concerns.
- Keep responses friendly, clear, and direct (usually 2 to 4 sentences). Never leave thoughts or sentences unfinished.
- Do not use markdown headers (#), asterisks (*), or bullet lists. Write natural, beautifully structured conversational paragraphs.
- If asked about serious medical conditions, gently advise consulting a board-certified dermatologist.`;

interface HistoryItem {
  sender: 'user' | 'ai';
  text: string;
}

export async function fetchGeminiChatResponse(
  conversationHistory: HistoryItem[],
  userPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const contents = conversationHistory
    .filter((m) => m.text && m.text.trim().length > 0)
    .slice(-10) // keep last 10 messages for context
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  // Append latest user message if not already included
  if (
    contents.length === 0 ||
    contents[contents.length - 1].parts[0]?.text !== userPrompt
  ) {
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });
  }

  const callModel = async (model: string): Promise<string | null> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text && typeof text === 'string') {
      // Clean up any stray markdown asterisks for clean mobile chat rendering
      const cleaned = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      return cleaned;
    }
    return null;
  };

  try {
    const result = await callModel(PRIMARY_MODEL);
    if (result) return result;
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError') {
      throw err;
    }
    // Primary model failed, fall through to fallback
  }

  if (signal?.aborted) {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  // Fallback to flash-lite
  try {
    const fallbackResult = await callModel(FALLBACK_MODEL);
    if (fallbackResult) return fallbackResult;
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError') {
      throw err;
    }
    // Fallback model also failed
  }

  if (signal?.aborted) {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  // If all models fail and no response was generated
  throw new Error('Unable to connect to Skin Story AI. Please check your internet connection.');
}
