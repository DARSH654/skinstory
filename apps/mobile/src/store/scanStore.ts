import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';

// ── Gemini Vision API ──────────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyBEZAMuBRSRyHD3w-wh_jUmMFE5mVj7oec';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

const SKIN_ANALYSIS_PROMPT = `You are an expert dermatologist and skin analysis AI. Analyze this face photo and provide a structured JSON skin analysis report.

Return ONLY valid JSON with this exact structure, no markdown, no explanation:
{
  "overall_score": <number 0-100, overall skin health>,
  "skin_type": "<Oily | Dry | Normal | Combination>",
  "concerns": [
    { "name": "<concern name>", "severity": "<None | Mild | Moderate | Severe>", "detected": <true|false> }
  ],
  "recommendations": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"],
  "summary": "<2-3 sentence overall skin health summary>"
}

The concerns array must include these items in order: Acne, Dark Circles, Eye Bags, Blackheads, Dark Spots, Wrinkles, Pores, Redness.
Be accurate but encouraging. If the image is not a face or is unclear, set overall_score to -1 and summary to "Could not analyze image. Please take a clear, well-lit photo of your face."`;

// ── Types ──────────────────────────────────────────────────────────────────
export interface SkinConcern {
  name: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  detected: boolean;
}

export interface SkinAnalysisResult {
  overall_score: number;
  skin_type: string;
  concerns: SkinConcern[];
  recommendations: string[];
  summary: string;
}

interface ScanState {
  imageUri: string | null;
  scanResult: SkinAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  setImage: (uri: string | null) => void;
  clearImage: () => void;
  runAnalysis: () => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
  imageUri: null,
  scanResult: null,
  isLoading: false,
  error: null,

  setImage: (uri) => set({ imageUri: uri, scanResult: null, error: null }),

  clearImage: () => set({ imageUri: null, scanResult: null, error: null, isLoading: false }),

  runAnalysis: async () => {
    const { imageUri } = get();
    if (!imageUri) {
      set({ error: 'No image found to analyze.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // ── Step 1: Read image as base64 ──────────────────────────────────
      let base64: string;

      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        const localPath = FileSystem.cacheDirectory + 'gemini_face.jpg';
        const download = await FileSystem.downloadAsync(imageUri, localPath);
        base64 = await FileSystem.readAsStringAsync(download.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Strip any data URI prefix just in case
      base64 = base64.replace(/^data:image\/\w+;base64,/, '').trim();

      // ── Step 2: Build Gemini request body ────────────────────────────
      const requestBody = {
        contents: [
          {
            parts: [
              { text: SKIN_ANALYSIS_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      };

      // ── Step 3: Call Gemini API ───────────────────────────────────────
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}: ${responseText}`);
      }

      const geminiData = JSON.parse(responseText);
      const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      // ── Step 4: Parse the JSON from Gemini's response ─────────────────
      // Strip markdown code fences if present
      const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result: SkinAnalysisResult = JSON.parse(jsonStr);

      set({ scanResult: result, isLoading: false, error: null });

    } catch (err: any) {
      set({
        error: err?.message || 'Analysis failed. Please try again.',
        isLoading: false,
      });
    }
  },
}));
