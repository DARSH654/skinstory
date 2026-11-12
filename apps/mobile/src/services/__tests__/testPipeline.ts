/**
 * End-to-end verification script for the complete Skin Forecasting Pipeline:
 * Stage 1 -> Stage 2 -> Stage 3 -> Stage 4
 */

// Load environment variables from apps/mobile/.env
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(process.cwd(), 'apps/mobile/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (key: string) => mockStorage[key] || null,
  setItem: async (key: string, val: string) => { mockStorage[key] = val; },
};

// Mock @react-native-async-storage/async-storage
require('module').prototype.require = (function(origRequire) {
  return function(this: any, path: string) {
    if (path === '@react-native-async-storage/async-storage') {
      return AsyncStorage;
    }
    return origRequire.apply(this, arguments);
  };
})(require('module').prototype.require);

const { extractStage1HistoryLogs } = require('../stage1RawDataRules');
const { assembleStage3EnginePayload } = require('../stage3EngineBridge');
const { runStage3ForecastEngine } = require('../stage3SkinForecastEngine');
const {
  buildDeterministicSynthesis,
  runFullSkinForecastingPipeline,
} = require('../stage4SynthesisEngine');

async function testPipeline() {
  console.log('--- STARTING COMPLETE SKIN FORECAST PIPELINE VERIFICATION ---');

  // Sample questions matching production
  const sampleQuestions = [
    {
      key: 'q_skin_map',
      prefix: 'Skin ',
      highlight: 'Experience',
      subtitle: 'Where and what are you experiencing on your skin today?',
      dataType: 'single_choice',
      options: [],
    },
    {
      key: 'q_routine',
      prefix: 'Routine ',
      highlight: 'Compliance',
      subtitle: 'Are you following your skincare routine today?',
      dataType: 'single_choice',
      options: [
        { label: 'Morning & evening routine', value: 'Morning & Evening' },
      ],
    },
    {
      key: 'q_water',
      prefix: 'Water ',
      highlight: 'Intake',
      subtitle: 'How much water have you had today?',
      dataType: 'numeric',
      unit: 'glasses',
      options: [],
    },
    {
      key: 'q_stress',
      prefix: 'Stress ',
      highlight: 'Check',
      subtitle: 'How stressed have you been today?',
      dataType: 'scale',
      options: [],
    },
  ];

  // 14-day mock user history with an active flare on cheeks and good routine compliance
  const now = Date.now();
  const mockHistory = [
    {
      id: 'rec-today',
      dateStr: 'Today',
      dayName: 'Monday',
      isoDate: new Date(now).toISOString().split('T')[0],
      answers: {
        q_skin_map: JSON.stringify({
          zones: [
            {
              id: 'cheeks',
              name: 'Cheeks',
              conditions: ['Redness & flushing'],
              severity: 4,
            },
            {
              id: 'jawline',
              name: 'Jawline',
              conditions: ['Rough dry patches'],
              severity: 3,
            },
          ],
          maxSeverityScale: 5,
        }),
        q_routine: 'Morning & Evening',
        q_water: '8 glasses',
        q_stress: '2',
      },
      answeredTimestamps: {
        q_skin_map: now - 1000 * 60 * 60 * 2, // 2 hours ago
        q_routine: now - 1000 * 60 * 60 * 4,
        q_water: now - 1000 * 60 * 60 * 1,
      },
    },
    {
      id: 'rec-yesterday',
      dateStr: 'Yesterday',
      dayName: 'Sunday',
      isoDate: new Date(now - 86400000).toISOString().split('T')[0],
      answers: {
        q_routine: 'Morning & Evening',
        q_water: '7 glasses',
        q_stress: '3',
      },
    },
    {
      id: 'rec-3-days-ago',
      dateStr: '3 days ago',
      dayName: 'Friday',
      isoDate: new Date(now - 86400000 * 3).toISOString().split('T')[0],
      answers: {
        q_routine: 'Morning',
        q_water: '4 glasses',
        q_stress: '4',
      },
    },
  ];

  console.log('\n[STAGE 1]: Running raw extraction...');
  const stage1Logs = extractStage1HistoryLogs(mockHistory, sampleQuestions);
  console.log(`  -> Extracted ${stage1Logs.length} sanitized daily logs`);
  console.log(`  -> Today has skin map: ${stage1Logs[0].hasSkinMap}`);
  console.log(`  -> Zones logged: ${stage1Logs[0].skinMapData?.zones?.length}`);

  console.log('\n[STAGE 2 & 3 BRIDGE]: Assembling engine payload...');
  const stage3Payload = await assembleStage3EnginePayload(stage1Logs, sampleQuestions, 'combination');
  console.log(`  -> Skin baseline loaded: combination`);
  console.log(`  -> Total clinical tickets collected & sorted: ${stage3Payload.chronologicalTickets.length}`);
  stage3Payload.chronologicalTickets.forEach((t: any, i: number) => {
    console.log(`     Ticket #${i + 1}: [${t.category.toUpperCase()}] intensity: ${t.intensity.toFixed(2)}, peak: ${t.peakHours}h, halfLife: ${t.halfLifeHours}h (${t.hoursAgo.toFixed(1)}h ago)`);
  });

  console.log('\n[STAGE 3 ENGINE]: Simulating continuous-time state space trajectory...');
  const stage3Result = runStage3ForecastEngine(stage3Payload);
  console.log('  -> Current State Vector at t_now:');
  console.log('     ', JSON.stringify(stage3Result.currentStateVector));
  console.log(`  -> Winning Forecast Horizon: ${stage3Result.winningForecast.horizonDisplay}`);
  console.log(`  -> Winning Dominant Axis: ${stage3Result.winningForecast.dominantAxis}`);
  console.log(`  -> Direction: ${stage3Result.winningForecast.direction}`);
  console.log(`  -> Severity Score: ${stage3Result.winningForecast.severityScore}`);

  console.log('\n[STAGE 4 SYNTHESIS]: Generating Deterministic Translation (0ms baseline)...');
  const deterministicSynthesis = buildDeterministicSynthesis(stage3Result, {
    skinType: 'combination',
    concerns: ['redness', 'barrier repair'],
    firstName: 'Alex',
  });
  console.log('  -> Hero Card:', JSON.stringify(deterministicSynthesis.heroCard, null, 2));
  console.log('  -> Clinical Insight:', JSON.stringify(deterministicSynthesis.clinicalInsight, null, 2));
  console.log('  -> Biomarkers Sample:', deterministicSynthesis.biomarkerDeltas.slice(0, 3));

  console.log('\n[STAGE 4 FULL PIPELINE RUNNER]: Running runFullSkinForecastingPipeline...');
  const fullPipelineResult = await runFullSkinForecastingPipeline(
    mockHistory,
    sampleQuestions,
    {
      skinType: 'combination',
      concerns: ['redness', 'barrier repair'],
      firstName: 'Alex',
    }
  );

  console.log('  -> Pipeline Result Source:', fullPipelineResult.source);
  console.log('  -> Hero Prefix:', fullPipelineResult.heroCard.prefix);
  console.log('  -> Hero Highlight:', fullPipelineResult.heroCard.highlight);
  console.log('  -> Hero Meta:', fullPipelineResult.heroCard.meta);
  console.log('  -> Clinical Action Tip:', fullPipelineResult.clinicalInsight.actionTip);

  console.log('\n--- VERIFICATION COMPLETED WITH ZERO ERRORS ---');
}

testPipeline().catch(console.error);
