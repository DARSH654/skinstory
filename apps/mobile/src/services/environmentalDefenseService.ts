/**
 * ============================================================================
 * Environmental Defense Service: Real-time Climate & Skin Protection Engine
 * ============================================================================
 * 
 * 1. Fetches hyper-local atmospheric data from WeatherAPI (UV, Dew Point, AQI, Humidity).
 * 2. Uses Gemini Flash (gemini-3.1-flash-lite) to translate the raw numbers into warm,
 *    conversational, non-technical skincare advice for the user's skin profile.
 * 3. Enforces strict length budgets so the response fits cleanly in the Home card without overflowing.
 * 4. Provides an instant, robust deterministic fallback so the UI never displays broken text.
 */

export interface EnvironmentalRawData {
  cityName: string;
  region: string;
  country: string;
  temp_c: number;
  feelslike_c: number;
  conditionText: string;
  uv: number;
  peakUv: number;
  humidity: number;
  dewpoint_c: number;
  wind_kph: number;
  gust_kph: number;
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  us_epa_index: number;
}

export interface EnvironmentalSynthesisResult {
  title: string;
  advice: string;
  cityName: string;
  temp_c: number;
  uv: number;
  lastUpdated: number;
  source: 'gemini' | 'deterministic-fallback';
}

function getWeatherApiKey(): string {
  return process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
}

function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
}

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Fetch live weather + air quality data for a location (or 'auto:ip' default)
 */
export async function fetchLiveEnvironmentalData(
  queryLocation: string = 'auto:ip',
  timeoutMs: number = 8000
): Promise<EnvironmentalRawData | null> {
  const apiKey = getWeatherApiKey();
  if (!apiKey) {
    console.warn('[ENV_DEFENSE] ⚠️ Missing EXPO_PUBLIC_WEATHER_API_KEY in environment.');
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(queryLocation)}&days=1&aqi=yes&pollen=yes`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.warn(`[ENV_DEFENSE] ⚠️ WeatherAPI returned HTTP ${response.status}: ${errBody.slice(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const loc = data?.location || {};
    const cur = data?.current || {};
    const aqi = cur?.air_quality || {};
    const hours = data?.forecast?.forecastday?.[0]?.hour || [];

    // Calculate peak UV for the day
    let peakUv = cur.uv || 0;
    if (Array.isArray(hours) && hours.length > 0) {
      for (const h of hours) {
        if (typeof h.uv === 'number' && h.uv > peakUv) {
          peakUv = h.uv;
        }
      }
    }

    return {
      cityName: loc.name || 'Local Area',
      region: loc.region || '',
      country: loc.country || '',
      temp_c: typeof cur.temp_c === 'number' ? Math.round(cur.temp_c) : 24,
      feelslike_c: typeof cur.feelslike_c === 'number' ? Math.round(cur.feelslike_c) : 24,
      conditionText: cur?.condition?.text || 'Clear',
      uv: typeof cur.uv === 'number' ? cur.uv : 0,
      peakUv: Math.round(peakUv * 10) / 10,
      humidity: typeof cur.humidity === 'number' ? cur.humidity : 50,
      dewpoint_c: typeof cur.dewpoint_c === 'number' ? Math.round(cur.dewpoint_c) : 10,
      wind_kph: typeof cur.wind_kph === 'number' ? Math.round(cur.wind_kph) : 10,
      gust_kph: typeof cur.gust_kph === 'number' ? Math.round(cur.gust_kph) : 15,
      pm2_5: typeof aqi.pm2_5 === 'number' ? Math.round(aqi.pm2_5) : 10,
      pm10: typeof aqi.pm10 === 'number' ? Math.round(aqi.pm10) : 15,
      o3: typeof aqi.o3 === 'number' ? Math.round(aqi.o3) : 20,
      no2: typeof aqi.no2 === 'number' ? Math.round(aqi.no2) : 20,
      us_epa_index: typeof aqi['us-epa-index'] === 'number' ? aqi['us-epa-index'] : 1,
    };
  } catch (error: any) {
    clearTimeout(timer);
    console.warn('[ENV_DEFENSE] ⚠️ Error fetching weather data:', error?.message || error);
    return null;
  }
}

/**
 * Deterministic fallback if Gemini or network is unavailable
 */
export function getDeterministicEnvironmentalFallback(
  weather: EnvironmentalRawData,
  skinType: string
): { title: string; advice: string } {
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18;

  if (isEvening) {
    if (weather.pm2_5 > 45 || weather.us_epa_index >= 3) {
      return {
        title: 'Evening Barrier Reset',
        advice: 'Wash away today’s heavy smog and city grime with a gentle cleanser, then apply a rich barrier cream.',
      };
    }
    return {
      title: 'Nighttime Barrier Recovery',
      advice: 'The sun has set. Focus on evening hydration and lock in moisture to help your skin heal overnight.',
    };
  }

  // Daytime logic
  if (weather.peakUv >= 7) {
    return {
      title: 'Intense Midday Sun',
      advice: 'Strong solar rays will peak midday. Apply broad-spectrum sunscreen before going out and reapply around lunchtime.',
    };
  }

  if (weather.pm2_5 > 50 || weather.us_epa_index >= 3) {
    return {
      title: 'Heavy Smog Defense',
      advice: 'Thick air pollution today can clog pores and dull your glow. Use an antioxidant layer and double-cleanse tonight.',
    };
  }

  if (weather.humidity < 35 || weather.dewpoint_c < 5) {
    return {
      title: 'Dry Air Shield',
      advice: 'Dry winter air is pulling moisture from your skin. Add a hydrating serum and keep your barrier locked.',
    };
  }

  if (weather.humidity > 75) {
    return {
      title: 'Humidity & Shine Defense',
      advice: 'High humidity can trap excess oil. Stick to lightweight gel textures and keep your pores fresh.',
    };
  }

  return {
    title: 'Balanced Climate Day',
    advice: 'Mild, stable weather today. Keep up with your daily hydration and finish with daily sun protection.',
  };
}

/**
 * Synthesizes empathetic, human conversational advice using Gemini
 */
export async function synthesizeEnvironmentalAdvice(
  weather: EnvironmentalRawData,
  skinType: string = 'Combination'
): Promise<{ title: string; advice: string; source: 'gemini' | 'deterministic-fallback' }> {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    console.log('[ENV_DEFENSE] No Gemini key found. Using deterministic fallback.');
    return {
      ...getDeterministicEnvironmentalFallback(weather, skinType),
      source: 'deterministic-fallback',
    };
  }

  const currentHour = new Date().getHours();
  const timeContext = currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening';

  const prompt = `You are an empathetic, personal skincare coach speaking directly to a friend.
Translate the following real-time environmental data into warm, conversational, non-technical skincare advice for a person with ${skinType} skin.

DATA:
City: ${weather.cityName}
Temperature: ${weather.temp_c}°C (Feels like: ${weather.feelslike_c}°C)
Sky: ${weather.conditionText}
Current UV: ${weather.uv}, Today's Peak UV was/will be: ${weather.peakUv}
Humidity: ${weather.humidity}% (Dew point: ${weather.dewpoint_c}°C)
Air Pollution: PM2.5 is ${weather.pm2_5}, Ozone is ${weather.o3}, EPA index is ${weather.us_epa_index}
Time of day: ${timeContext} (${currentHour}:00)

CRITICAL RULES:
1. ZERO TECHNICAL JARGON: Never say "PM2.5", "NO2", "O3", "dew point", or numerical units. Use everyday human phrases like "heavy smog", "intense sun", "dry air", "evening pollution", "sticky humidity".
2. EXACT LENGTH BUDGET (MANDATORY):
   - "title": Exactly 2 to 4 words (maximum 25 characters). Punchy human headline. Examples: "Heavy Smog Defense", "Evening Barrier Reset", "Intense Sun Alert", "Dry Air Hydration".
   - "advice": Strictly between 18 and 24 words (maximum 135 characters, fitting cleanly on 2-3 lines). Give 1 concrete action.
3. OUTPUT: Return strictly JSON: { "title": "...", "advice": "..." }`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
          responseMimeType: 'application/json',
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[ENV_DEFENSE] ⚠️ Gemini returned HTTP ${response.status}. Using fallback.`);
      return {
        ...getDeterministicEnvironmentalFallback(weather, skinType),
        source: 'deterministic-fallback',
      };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      if (parsed.title && parsed.advice) {
        return {
          title: parsed.title.trim().slice(0, 30),
          advice: parsed.advice.trim().slice(0, 150),
          source: 'gemini',
        };
      }
    }
  } catch (err: any) {
    console.warn('[ENV_DEFENSE] ⚠️ Gemini synthesis error:', err?.message || err);
  }

  return {
    ...getDeterministicEnvironmentalFallback(weather, skinType),
    source: 'deterministic-fallback',
  };
}

/**
 * Master Pipeline Runner
 */
export async function runEnvironmentalSync(
  queryLocation: string = 'auto:ip',
  skinType: string = 'Combination'
): Promise<EnvironmentalSynthesisResult> {
  console.log(`[ENV_DEFENSE] 🚀 Running environmental defense sync for location: "${queryLocation}" (${skinType} skin)...`);
  const weather = await fetchLiveEnvironmentalData(queryLocation);

  if (!weather) {
    // If offline or completely failed
    return {
      title: 'Climate Defense',
      advice: 'Unable to connect to live weather right now. Keep your skin hydrated and finish with sunscreen.',
      cityName: 'Local Area',
      temp_c: 25,
      uv: 0,
      lastUpdated: Date.now(),
      source: 'deterministic-fallback',
    };
  }

  const synthesis = await synthesizeEnvironmentalAdvice(weather, skinType);
  console.log(`[ENV_DEFENSE] ✅ Synced successfully for ${weather.cityName} (${weather.temp_c}°C). Title: "${synthesis.title}"`);

  return {
    title: synthesis.title,
    advice: synthesis.advice,
    cityName: weather.cityName,
    temp_c: weather.temp_c,
    uv: weather.uv,
    lastUpdated: Date.now(),
    source: synthesis.source,
  };
}
