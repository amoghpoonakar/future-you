/**
 * FUTURE YOU – AI Health Time Machine
 * Advanced AI Reasoning + NLP + Medical History Engine
 */

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let medicalDataset = null;
let currentTab = 5;
let lastResults = null;
let userSex = 'male';
let reasoningOpen = false;

// ──────────────────────────────────────────────
// LOAD DATASET
// ──────────────────────────────────────────────
async function loadDataset() {
  const dot = document.getElementById('dsDot');
  const label = document.getElementById('dsLabel');
  try {
    const res = await fetch('./data/mock-medical-dataset.json');
    if (!res.ok) throw new Error('Fetch failed');
    medicalDataset = await res.json();
    dot.classList.add('ok');
    label.textContent = `✓ Medical dataset loaded — ${medicalDataset.meta.source} (${medicalDataset.meta.population_size.toLocaleString()} records)`;
  } catch (e) {
    // Use embedded fallback dataset
    medicalDataset = getEmbeddedDataset();
    dot.classList.add('ok');
    label.textContent = `✓ Embedded medical dataset active — Simulated Clinical Data v2.1`;
  }
}

// ──────────────────────────────────────────────
// EMBEDDED FALLBACK DATASET (mirrors the JSON)
// ──────────────────────────────────────────────
function getEmbeddedDataset() {
  return {
    population_risk_benchmarks: {
      diabetes: { base_risk: 10.5, bmi_overweight_modifier: 1.8, bmi_obese_modifier: 3.2, sedentary_modifier: 1.5, family_history_modifier: 2.4, poor_diet_modifier: 1.3, age_over_45_modifier: 1.7 },
      heart_disease: { base_risk: 8.2, smoking_modifier: 2.5, bmi_obese_modifier: 1.9, sedentary_modifier: 1.6, family_history_modifier: 2.1, stress_modifier: 1.4, poor_sleep_modifier: 1.3 },
      hypertension: { base_risk: 12.0, bmi_obese_modifier: 2.0, high_stress_modifier: 1.7, poor_diet_modifier: 1.5, sedentary_modifier: 1.4, smoking_modifier: 1.6, age_over_40_modifier: 1.5 },
      obesity: { base_risk: 15.0, sedentary_modifier: 2.2, poor_diet_modifier: 2.0, poor_sleep_modifier: 1.4, stress_modifier: 1.3 },
      bone_health: { base_risk: 9.0, vitamin_d_deficiency_modifier: 2.3, calcium_deficiency_modifier: 2.0, sedentary_modifier: 1.5, age_over_50_modifier: 1.8, female_modifier: 1.6 },
      mental_health: { base_risk: 18.0, poor_sleep_modifier: 2.0, high_stress_modifier: 2.2, sedentary_modifier: 1.4, social_isolation_modifier: 1.8 },
      respiratory: { base_risk: 7.0, smoking_modifier: 3.5, obesity_modifier: 1.7, sedentary_modifier: 1.3 }
    },
    keyword_risk_map: {
      "vitamin d deficiency": { bone_health: 2.3, mental_health: 1.3 },
      "vitamin d": { bone_health: 2.0, mental_health: 1.2 },
      "diabetes": { diabetes: 2.4, heart_disease: 1.5, hypertension: 1.3 },
      "diabetic": { diabetes: 2.4, heart_disease: 1.5 },
      "heart disease": { heart_disease: 2.1, hypertension: 1.4 },
      "heart attack": { heart_disease: 2.8, hypertension: 1.6 },
      "hypertension": { hypertension: 2.2, heart_disease: 1.4 },
      "blood pressure": { hypertension: 1.9, heart_disease: 1.3 },
      "obesity": { obesity: 2.0, diabetes: 1.6, heart_disease: 1.5 },
      "overweight": { obesity: 1.6, diabetes: 1.3 },
      "cholesterol": { heart_disease: 1.8, hypertension: 1.4 },
      "thyroid": { obesity: 1.3, mental_health: 1.2 },
      "asthma": { respiratory: 2.0 },
      "depression": { mental_health: 2.2 },
      "anxiety": { mental_health: 1.9 },
      "stroke": { heart_disease: 2.5, hypertension: 2.0 },
      "kidney": { hypertension: 1.5 },
      "iron deficiency": { mental_health: 1.2 },
      "anemia": { mental_health: 1.3 },
      "calcium deficiency": { bone_health: 2.0 },
      "vitamin b12": { mental_health: 1.4 },
      "b12 deficiency": { mental_health: 1.5 },
      "headaches": { hypertension: 1.2, mental_health: 1.1 },
      "frequent headaches": { hypertension: 1.4, mental_health: 1.2 },
      "fatigue": { mental_health: 1.3 },
      "low energy": { mental_health: 1.2 },
      "poor sleep": { mental_health: 1.8, heart_disease: 1.3, obesity: 1.3 },
      "insomnia": { mental_health: 1.9, heart_disease: 1.2 },
      "joint pain": { bone_health: 1.5, obesity: 1.2 },
      "back pain": { bone_health: 1.3, obesity: 1.2 },
      "shortness of breath": { respiratory: 1.7, heart_disease: 1.4 },
      "chest pain": { heart_disease: 2.0, hypertension: 1.6 },
      "blurred vision": { diabetes: 1.6, hypertension: 1.3 },
      "frequent urination": { diabetes: 1.8 },
      "excessive thirst": { diabetes: 1.9 },
      "dizziness": { hypertension: 1.5 },
      "weight gain": { obesity: 1.4 },
      "stress": { heart_disease: 1.4, hypertension: 1.4, mental_health: 1.6 },
      "family history": { heart_disease: 1.5, diabetes: 1.5, hypertension: 1.3 }
    },
    meta: { source: "Simulated Clinical Dataset v2.1", population_size: 50000 }
  };
}

// ──────────────────────────────────────────────
// RANGE INPUT BINDINGS
// ──────────────────────────────────────────────
function bindRanges() {
  const inputs = ['age', 'height', 'weight'];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      updateBMILive();
    });
  });

  // Keep these as sliders (unchanged)
  const ranges = [
    { id: 'exercise', valId: 'exerciseVal', fmt: v => `${v} day${v == 1 ? '' : 's'}` },
    { id: 'sleep', valId: 'sleepVal', fmt: v => `${v} hrs` },
    { id: 'stress', valId: 'stressVal', fmt: v => `${v} / 10` },
  ];

  ranges.forEach(({ id, valId, fmt }) => {
    const el = document.getElementById(id);
    const val = document.getElementById(valId);
    el.addEventListener('input', () => {
      val.textContent = fmt(el.value);
      updateBMILive();
    });
  });

  // NLP listeners (unchanged)
  document.getElementById('healthNotes')
    .addEventListener('input', () => extractAndShowKeywords('healthNotes', 'notesKeywords', false));

  document.getElementById('medHistory')
    .addEventListener('input', () => extractAndShowKeywords('medHistory', 'historyKeywords', true));
}

function setSex(sex) {
  userSex = sex;
  document.getElementById('togMale').classList.toggle('active', sex === 'male');
  document.getElementById('togFemale').classList.toggle('active', sex === 'female');
}

// ──────────────────────────────────────────────
// BMI LIVE UPDATE
// ──────────────────────────────────────────────
function updateBMILive() {
  const h = parseInt(document.getElementById('height').value) / 100;
  const w = parseInt(document.getElementById('weight').value);
  const bmi = (w / (h * h)).toFixed(1);
  const bmiEl = document.getElementById('bmiValue');
  const catEl = document.getElementById('bmiCategory');
  const marker = document.getElementById('bmiMarker');

  bmiEl.textContent = bmi;

  let cat, color, pos;
  if (bmi < 18.5) { cat = 'Underweight'; color = '#3b82f6'; pos = 5; }
  else if (bmi < 25) { cat = 'Normal Weight'; color = '#10b981'; pos = Math.min(30, 10 + (bmi - 18.5) * 2.8); }
  else if (bmi < 30) { cat = 'Overweight'; color = '#f59e0b'; pos = Math.min(65, 35 + (bmi - 25) * 5.5); }
  else { cat = 'Obese'; color = '#ef4444'; pos = Math.min(95, 65 + (bmi - 30) * 3); }

  catEl.textContent = cat;
  catEl.style.color = color;
  bmiEl.style.color = color;
  marker.style.left = pos + '%';
}

// ──────────────────────────────────────────────
// NLP KEYWORD EXTRACTION
// ──────────────────────────────────────────────
function extractKeywords(text) {
  if (!medicalDataset || !text.trim()) return [];
  const lower = text.toLowerCase();
  const matched = [];
  const map = medicalDataset.keyword_risk_map;

  // Sort by length desc so "frequent headaches" matches before "headaches"
  const sorted = Object.keys(map).sort((a, b) => b.length - a.length);
  const used = new Set();

  sorted.forEach(kw => {
    if (lower.includes(kw) && !used.has(kw)) {
      matched.push(kw);
      // Mark sub-phrases as used to avoid double counting
      kw.split(' ').forEach(w => used.add(w));
      used.add(kw);
    }
  });

  return matched;
}

function extractAndShowKeywords(inputId, chipContainerId, isPriority) {
  const text = document.getElementById(inputId).value;
  const keywords = extractKeywords(text);
  const container = document.getElementById(chipContainerId);
  container.innerHTML = '';
  keywords.forEach(kw => {
    const chip = document.createElement('span');
    chip.className = isPriority ? 'chip priority' : 'chip';
    chip.textContent = '🔑 ' + kw;
    container.appendChild(chip);
  });
}

// ──────────────────────────────────────────────
// RISK CALCULATION ENGINE
// ──────────────────────────────────────────────
function calculateRisks(years) {
  const age = parseInt(document.getElementById('age').value);
  const height = parseInt(document.getElementById('height').value) / 100;
  const weight = parseInt(document.getElementById('weight').value);
  const exercise = parseInt(document.getElementById('exercise').value);
  const sleep = parseInt(document.getElementById('sleep').value);
  const stress = parseInt(document.getElementById('stress').value);
  const diet = document.getElementById('diet').value;
  const smoking = document.getElementById('smoking').value;
  const alcohol = document.getElementById('alcohol').value;

  const bmi = weight / (height * height);
  const bmiOverweight = bmi >= 25 && bmi < 30;
  const bmiObese = bmi >= 30;
  const sedentary = exercise <= 1;
  const lowExercise = exercise <= 2;
  const poorSleep = sleep < 6;
  const highStress = stress >= 7;
  const poorDiet = diet === 'poor' || diet === 'very_poor';

  // ── Base risks from dataset ──
  const bench = medicalDataset.population_risk_benchmarks;

  let risks = {
    diabetes: bench.diabetes.base_risk,
    heart_disease: bench.heart_disease.base_risk,
    hypertension: bench.hypertension.base_risk,
    obesity: bench.obesity.base_risk,
    bone_health: bench.bone_health.base_risk,
    mental_health: bench.mental_health.base_risk,
    respiratory: bench.respiratory.base_risk,
  };

  // Reasoning steps array
  const reasoningSteps = [];
  let stepNum = 1;

  // ── STEP 1: BMI ──
  if (bmiObese) {
    risks.diabetes *= bench.diabetes.bmi_obese_modifier;
    risks.heart_disease *= bench.heart_disease.bmi_obese_modifier;
    risks.hypertension *= bench.hypertension.bmi_obese_modifier;
    risks.respiratory *= 1.7;
    reasoningSteps.push({ num: stepNum++, title: `BMI ${bmi.toFixed(1)} → Obese`, detail: 'Significantly increases diabetes, heart disease, hypertension, and respiratory risks.', badge: '⚠️ High Impact', badgeColor: '#ef4444' });
  } else if (bmiOverweight) {
    risks.diabetes *= bench.diabetes.bmi_overweight_modifier;
    risks.obesity *= 1.5;
    reasoningSteps.push({ num: stepNum++, title: `BMI ${bmi.toFixed(1)} → Overweight`, detail: 'Moderately increases diabetes and obesity risk.', badge: '⚡ Moderate', badgeColor: '#f59e0b' });
  } else if (bmi < 18.5) {
    risks.bone_health *= 1.4;
    reasoningSteps.push({ num: stepNum++, title: `BMI ${bmi.toFixed(1)} → Underweight`, detail: 'May affect bone density and immune function.', badge: '📋 Note', badgeColor: '#3b82f6' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: `BMI ${bmi.toFixed(1)} → Normal`, detail: 'Healthy weight range — no BMI-based risk elevation.', badge: '✅ Good', badgeColor: '#10b981' });
  }

  // ── STEP 2: Exercise ──
  if (sedentary) {
    risks.diabetes *= bench.diabetes.sedentary_modifier;
    risks.heart_disease *= bench.heart_disease.sedentary_modifier;
    risks.hypertension *= bench.hypertension.sedentary_modifier;
    risks.obesity *= bench.obesity.sedentary_modifier;
    risks.bone_health *= bench.bone_health.sedentary_modifier;
    risks.mental_health *= bench.mental_health.sedentary_modifier;
    risks.respiratory *= bench.respiratory.sedentary_modifier;
    reasoningSteps.push({ num: stepNum++, title: `Exercise: ${exercise} day/week → Sedentary`, detail: 'Very low activity amplifies virtually all health risks.', badge: '⚠️ High Risk', badgeColor: '#ef4444' });
  } else if (lowExercise) {
    risks.diabetes *= 1.2;
    risks.heart_disease *= 1.2;
    risks.obesity *= 1.3;
    reasoningSteps.push({ num: stepNum++, title: `Exercise: ${exercise} days/week → Low`, detail: 'Below-recommended activity. Modest increase in metabolic risks.', badge: '⚡ Moderate', badgeColor: '#f59e0b' });
  } else if (exercise >= 5) {
    risks.diabetes *= 0.75;
    risks.heart_disease *= 0.8;
    risks.obesity *= 0.7;
    risks.mental_health *= 0.8;
    reasoningSteps.push({ num: stepNum++, title: `Exercise: ${exercise} days/week → Active`, detail: 'Regular exercise significantly reduces metabolic and cardiac risks.', badge: '✅ Protective', badgeColor: '#10b981' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: `Exercise: ${exercise} days/week → Moderate`, detail: 'Acceptable activity level.', badge: '✅ OK', badgeColor: '#10b981' });
  }

  // ── STEP 3: Smoking ──
  if (smoking === 'heavy') {
    risks.heart_disease *= bench.heart_disease.smoking_modifier;
    risks.hypertension *= bench.hypertension.smoking_modifier;
    risks.respiratory *= bench.respiratory.smoking_modifier;
    reasoningSteps.push({ num: stepNum++, title: 'Smoking: Heavy', detail: 'Heavy smoking drastically raises heart disease and respiratory disease risk.', badge: '🚨 Critical', badgeColor: '#ef4444' });
  } else if (smoking === 'regular') {
    risks.heart_disease *= 2.0;
    risks.hypertension *= 1.4;
    risks.respiratory *= 2.5;
    reasoningSteps.push({ num: stepNum++, title: 'Smoking: Regular', detail: 'Regular smoking significantly increases cardiac and lung risk.', badge: '⚠️ High Risk', badgeColor: '#ef4444' });
  } else if (smoking === 'occasional') {
    risks.heart_disease *= 1.4;
    risks.respiratory *= 1.6;
    reasoningSteps.push({ num: stepNum++, title: 'Smoking: Occasional', detail: 'Even occasional smoking elevates heart and lung risks.', badge: '⚡ Moderate', badgeColor: '#f59e0b' });
  } else if (smoking === 'former') {
    risks.heart_disease *= 1.3;
    risks.respiratory *= 1.4;
    reasoningSteps.push({ num: stepNum++, title: 'Smoking: Former', detail: 'Residual risk from past smoking. Risk continues to decrease with time.', badge: '📋 Residual', badgeColor: '#3b82f6' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: 'Smoking: Never', detail: 'No smoking-related risk factor.', badge: '✅ Protective', badgeColor: '#10b981' });
  }

  // ── STEP 4: Sleep ──
  if (poorSleep) {
    risks.mental_health *= bench.mental_health.poor_sleep_modifier;
    risks.heart_disease *= bench.heart_disease.poor_sleep_modifier;
    risks.obesity *= bench.obesity.poor_sleep_modifier;
    reasoningSteps.push({ num: stepNum++, title: `Sleep: ${sleep} hrs → Insufficient`, detail: 'Poor sleep drives up mental health, obesity, and cardiac risks.', badge: '⚠️ High Impact', badgeColor: '#ef4444' });
  } else if (sleep >= 8) {
    risks.mental_health *= 0.85;
    risks.heart_disease *= 0.9;
    reasoningSteps.push({ num: stepNum++, title: `Sleep: ${sleep} hrs → Optimal`, detail: 'Good sleep provides protective effect on heart and mental health.', badge: '✅ Good', badgeColor: '#10b981' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: `Sleep: ${sleep} hrs → Adequate`, detail: 'Within acceptable range.', badge: '✅ OK', badgeColor: '#10b981' });
  }

  // ── STEP 5: Stress ──
  if (highStress) {
    risks.hypertension *= bench.hypertension.high_stress_modifier;
    risks.heart_disease *= bench.heart_disease.stress_modifier;
    risks.mental_health *= bench.mental_health.high_stress_modifier;
    risks.obesity *= bench.obesity.stress_modifier;
    reasoningSteps.push({ num: stepNum++, title: `Stress: ${stress}/10 → High`, detail: 'Chronic stress is a major driver of hypertension, cardiac, and mental health risk.', badge: '⚠️ High Impact', badgeColor: '#ef4444' });
  } else if (stress <= 3) {
    risks.hypertension *= 0.85;
    risks.mental_health *= 0.85;
    reasoningSteps.push({ num: stepNum++, title: `Stress: ${stress}/10 → Low`, detail: 'Low stress provides protective effect.', badge: '✅ Good', badgeColor: '#10b981' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: `Stress: ${stress}/10 → Moderate`, detail: 'Manageable stress level.', badge: '📋 Moderate', badgeColor: '#f59e0b' });
  }

  // ── STEP 6: Diet ──
  if (poorDiet) {
    risks.diabetes *= bench.diabetes.poor_diet_modifier;
    risks.hypertension *= bench.hypertension.poor_diet_modifier;
    risks.obesity *= bench.obesity.poor_diet_modifier;
    reasoningSteps.push({ num: stepNum++, title: `Diet: ${diet.replace('_', ' ')} → Poor`, detail: 'Poor diet significantly elevates metabolic disease risk.', badge: '⚠️ High Risk', badgeColor: '#ef4444' });
  } else if (diet === 'excellent') {
    risks.diabetes *= 0.8;
    risks.hypertension *= 0.85;
    risks.obesity *= 0.75;
    risks.heart_disease *= 0.8;
    reasoningSteps.push({ num: stepNum++, title: 'Diet: Excellent', detail: 'Excellent nutrition significantly reduces metabolic risks.', badge: '✅ Protective', badgeColor: '#10b981' });
  } else {
    reasoningSteps.push({ num: stepNum++, title: `Diet: ${diet}`, detail: 'Acceptable dietary pattern.', badge: '📋 OK', badgeColor: '#3b82f6' });
  }

  // ── STEP 7: Age ──
  if (age > 45) {
    risks.diabetes *= bench.diabetes.age_over_45_modifier;
    reasoningSteps.push({ num: stepNum++, title: `Age: ${age} → Over 45`, detail: 'Age significantly increases baseline diabetes risk.', badge: '📋 Age Factor', badgeColor: '#8b5cf6' });
  }
  if (age > 40) {
    risks.hypertension *= bench.hypertension.age_over_40_modifier;
  }
  if (age > 50) {
    risks.bone_health *= bench.bone_health.age_over_50_modifier;
  }

  // ── STEP 8: Sex ──
  if (userSex === 'female') {
    risks.bone_health *= bench.bone_health.female_modifier;
    reasoningSteps.push({ num: stepNum++, title: 'Sex: Female → Bone Health Modifier', detail: 'Higher bone health risk due to hormonal factors, especially post-menopause.', badge: '📋 Factor', badgeColor: '#ec4899' });
  }

  // ── STEP 9: Alcohol ──
  if (alcohol === 'heavy') {
    risks.heart_disease *= 1.5;
    risks.hypertension *= 1.6;
    risks.mental_health *= 1.4;
    reasoningSteps.push({ num: stepNum++, title: 'Alcohol: Heavy', detail: 'Heavy drinking raises blood pressure and cardiac risk.', badge: '⚠️ High Risk', badgeColor: '#ef4444' });
  }

  // ── STEP 10: NLP from General Health Notes (weight 1.0x) ──
  const notesText = document.getElementById('healthNotes').value;
  const notesKeywords = extractKeywords(notesText);

  if (notesKeywords.length > 0) {
    let notesImpact = [];
    notesKeywords.forEach(kw => {
      const kwRisks = medicalDataset.keyword_risk_map[kw];
      if (kwRisks) {
        Object.entries(kwRisks).forEach(([riskKey, modifier]) => {
          if (risks[riskKey] !== undefined) {
            risks[riskKey] *= modifier;
            notesImpact.push(`"${kw}" → ${riskKey.replace('_', ' ')} risk ↑`);
          }
        });
      }
    });
    if (notesImpact.length > 0) {
      reasoningSteps.push({
        num: stepNum++,
        title: `Health Notes Analysis (${notesKeywords.length} keywords detected)`,
        detail: notesImpact.slice(0, 5).join('; ') + (notesImpact.length > 5 ? '...' : ''),
        badge: '🔍 NLP',
        badgeColor: '#7c3aed'
      });
    }
  }

  // ── STEP 11: NLP from Medical History (weight 1.5x — HIGH PRIORITY) ──
  const historyText = document.getElementById('medHistory').value;
  const historyKeywords = extractKeywords(historyText);
  const historyWeight = 1.5; // Medical history has higher weight

  if (historyKeywords.length > 0) {
    let histImpact = [];
    historyKeywords.forEach(kw => {
      const kwRisks = medicalDataset.keyword_risk_map[kw];
      if (kwRisks) {
        Object.entries(kwRisks).forEach(([riskKey, modifier]) => {
          if (risks[riskKey] !== undefined) {
            const weightedModifier = 1 + (modifier - 1) * historyWeight;
            risks[riskKey] *= weightedModifier;
            histImpact.push(`"${kw}" → ${riskKey.replace('_', ' ')} risk ↑↑ (×${historyWeight} weight)`);
          }
        });
      }
    });
    if (histImpact.length > 0) {
      reasoningSteps.push({
        num: stepNum++,
        title: `Medical History Analysis (${historyKeywords.length} keywords — HIGH PRIORITY)`,
        detail: histImpact.slice(0, 5).join('; ') + (histImpact.length > 5 ? '...' : ''),
        badge: '🚨 Priority',
        badgeColor: '#ef4444'
      });
    }
  }

  // ── STEP 12: Time projection ──
  const yearFactor = 1 + (years / 100) * 0.8;
  Object.keys(risks).forEach(k => risks[k] *= yearFactor);

  reasoningSteps.push({
    num: stepNum++,
    title: `${years}-Year Projection Applied`,
    detail: `All risks scaled by ${years}-year accumulation factor (×${yearFactor.toFixed(2)}).`,
    badge: '⏱️ Time',
    badgeColor: '#0ea5e9'
  });

  // ── Cap risks at 95% ──
  Object.keys(risks).forEach(k => risks[k] = Math.min(95, Math.round(risks[k] * 10) / 10));

  // ── FINAL COMBINED ASSESSMENT ──
  const avgRisk = Object.values(risks).reduce((a, b) => a + b, 0) / Object.values(risks).length;
  let overallLevel, overallBadge, overallColor;
  if (avgRisk < 20) { overallLevel = 'Low Overall Risk'; overallBadge = '✅ Good'; overallColor = '#10b981'; }
  else if (avgRisk < 35) { overallLevel = 'Moderate Overall Risk'; overallBadge = '⚡ Moderate'; overallColor = '#f59e0b'; }
  else if (avgRisk < 55) { overallLevel = 'High Overall Risk'; overallBadge = '⚠️ High'; overallColor = '#f97316'; }
  else { overallLevel = 'Very High Overall Risk'; overallBadge = '🚨 Critical'; overallColor = '#ef4444'; }

  reasoningSteps.push({
    num: stepNum++,
    title: `Combined Risk Assessment → ${overallLevel}`,
    detail: `Average risk across all categories: ${avgRisk.toFixed(1)}%. This is your ${years}-year health trajectory based on current lifestyle.`,
    badge: overallBadge,
    badgeColor: overallColor
  });

  return { risks, reasoningSteps, bmi, notesKeywords, historyKeywords };
}

// ──────────────────────────────────────────────
// RISK DEFINITIONS (UI config)
// ──────────────────────────────────────────────
const RISK_CONFIG = [
  { key: 'diabetes', label: 'Diabetes', icon: '🩸' },
  { key: 'heart_disease', label: 'Heart Disease', icon: '❤️' },
  { key: 'hypertension', label: 'Hypertension', icon: '🫀' },
  { key: 'obesity', label: 'Obesity', icon: '⚖️' },
  { key: 'bone_health', label: 'Bone Health', icon: '🦴' },
  { key: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { key: 'respiratory', label: 'Respiratory', icon: '🫁' },
];

function getRiskClass(pct) {
  if (pct < 20) return 'risk-low';
  if (pct < 40) return 'risk-moderate';
  if (pct < 60) return 'risk-high';
  return 'risk-very-high';
}

function getRiskFillClass(pct) {
  if (pct < 20) return 'fill-low';
  if (pct < 40) return 'fill-moderate';
  if (pct < 60) return 'fill-high';
  return 'fill-very-high';
}

function getRiskLabel(pct) {
  if (pct < 20) return 'Low';
  if (pct < 40) return 'Moderate';
  if (pct < 60) return 'High';
  return 'Very High';
}

// ──────────────────────────────────────────────
// RENDER RISK CARDS
// ──────────────────────────────────────────────
function renderRiskCards(risks) {
  const grid = document.getElementById('riskGrid');
  grid.innerHTML = '';

  RISK_CONFIG.forEach((cfg, i) => {
    const pct = risks[cfg.key] || 0;
    const card = document.createElement('div');
    card.className = 'risk-card';
    card.style.animationDelay = `${i * 60}ms`;

    card.innerHTML = `
      <div class="risk-card-icon">${cfg.icon}</div>
      <div class="risk-card-name">${cfg.label}</div>
      <div class="risk-card-pct ${getRiskClass(pct)}">${pct.toFixed(1)}%</div>
      <div class="risk-bar-wrap">
        <div class="risk-bar-fill ${getRiskFillClass(pct)}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <div class="risk-card-level ${getRiskClass(pct)}">${getRiskLabel(pct)} Risk</div>
    `;
    grid.appendChild(card);
  });
}

// ──────────────────────────────────────────────
// RENDER AI REASONING
// ──────────────────────────────────────────────
function renderReasoning(steps) {
  const body = document.getElementById('aiReasoningBody');
  body.innerHTML = '';
  steps.forEach((step, i) => {
    const div = document.createElement('div');
    div.className = 'reasoning-step';
    div.style.animationDelay = `${i * 50}ms`;
    div.innerHTML = `
      <div class="step-num">${step.num}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-detail">${step.detail}</div>
      </div>
      <span class="step-badge" style="background:${step.badgeColor}22;color:${step.badgeColor};border:1px solid ${step.badgeColor}44">${step.badge}</span>
    `;
    body.appendChild(div);
  });
  document.getElementById('aiPanel').style.display = 'block';
}

// ──────────────────────────────────────────────
// RENDER EXPLANATIONS
// ──────────────────────────────────────────────
function renderExplanations(risks, notesKws, historyKws) {
  const list = document.getElementById('explanationsList');
  list.innerHTML = '';

  const notesText = document.getElementById('healthNotes').value.toLowerCase();
  const historyText = document.getElementById('medHistory').value.toLowerCase();
  const exercise = parseInt(document.getElementById('exercise').value);
  const sleep = parseInt(document.getElementById('sleep').value);

  RISK_CONFIG.forEach(cfg => {
    const pct = risks[cfg.key];
    if (pct < 15) return; // skip very low risks

    const reasons = [];

    // Dynamic reason generation based on risk key
    const h = parseInt(document.getElementById('height').value) / 100;
    const w = parseInt(document.getElementById('weight').value);
    const bmi = w / (h * h);

    if (cfg.key === 'diabetes') {
      if (bmi >= 25) reasons.push('BMI above normal range');
      if (exercise <= 2) reasons.push('Low physical activity');
      if (historyText.includes('diabet')) reasons.push('Diabetes in medical history (high priority)');
      if (historyText.includes('family history')) reasons.push('Family history detected');
      if (document.getElementById('diet').value.includes('poor')) reasons.push('Poor dietary habits');
    }

    if (cfg.key === 'heart_disease') {
      const smoking = document.getElementById('smoking').value;
      if (smoking !== 'never') reasons.push(`Smoking: ${smoking}`);
      if (bmi >= 30) reasons.push('Obese BMI');
      if (historyText.includes('heart')) reasons.push('Family/personal heart disease history (high priority)');
      if (historyText.includes('cholesterol')) reasons.push('Cholesterol issues detected');
      if (parseInt(document.getElementById('stress').value) >= 7) reasons.push('High stress levels');
      if (sleep < 6) reasons.push('Insufficient sleep');
    }

    if (cfg.key === 'hypertension') {
      if (parseInt(document.getElementById('stress').value) >= 7) reasons.push('High chronic stress');
      if (bmi >= 30) reasons.push('Obese BMI');
      if (historyText.includes('blood pressure') || historyText.includes('hypertension')) reasons.push('Blood pressure history (high priority)');
      if (notesText.includes('headache')) reasons.push('Frequent headaches noted');
    }

    if (cfg.key === 'mental_health') {
      if (sleep < 6) reasons.push('Chronic sleep deprivation');
      if (parseInt(document.getElementById('stress').value) >= 7) reasons.push('High stress levels');
      if (notesText.includes('low energy') || notesText.includes('fatigue')) reasons.push('Fatigue/low energy reported');
      if (notesText.includes('poor sleep') || notesText.includes('insomnia')) reasons.push('Sleep problems noted');
      if (historyText.includes('depression') || historyText.includes('anxiety')) reasons.push('Mental health history (high priority)');
    }

    if (cfg.key === 'bone_health') {
      if (historyText.includes('vitamin d')) reasons.push('Vitamin D deficiency detected (high priority)');
      if (historyText.includes('calcium')) reasons.push('Calcium deficiency in history');
      if (exercise <= 1) reasons.push('Very low physical activity');
      if (userSex === 'female') reasons.push('Biological sex factor');
    }

    if (cfg.key === 'obesity') {
      if (bmi >= 25) reasons.push('Current BMI overweight/obese');
      if (exercise <= 2) reasons.push('Insufficient exercise');
      if (document.getElementById('diet').value.includes('poor')) reasons.push('Poor diet quality');
      if (sleep < 6) reasons.push('Poor sleep affects metabolism');
    }

    if (cfg.key === 'respiratory') {
      const smoking = document.getElementById('smoking').value;
      if (smoking !== 'never') reasons.push(`Smoking status: ${smoking}`);
      if (historyText.includes('asthma')) reasons.push('Asthma in medical history (high priority)');
      if (bmi >= 30) reasons.push('Obesity affects breathing');
    }

    if (reasons.length === 0) reasons.push('Multiple lifestyle factors contributing');

    const item = document.createElement('div');
    item.className = 'explanation-item';
    item.innerHTML = `
      <div class="exp-risk-name">
        <span>${cfg.icon}</span>
        <span style="color:${pct >= 60 ? '#ef4444' : pct >= 40 ? '#f97316' : pct >= 20 ? '#f59e0b' : '#10b981'}">${cfg.label} — ${pct.toFixed(1)}% Risk</span>
      </div>
      <div class="exp-reason">
        <strong>Why this risk level?</strong>
        <ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    `;
    list.appendChild(item);
  });

  document.getElementById('explanationsWrap').style.display = 'block';
}

// ──────────────────────────────────────────────
// RENDER RECOMMENDATIONS
// ──────────────────────────────────────────────
function renderRecommendations(risks) {
  const recoList = document.getElementById('recoList');
  recoList.innerHTML = '';

  const smoking = document.getElementById('smoking').value;
  const exercise = parseInt(document.getElementById('exercise').value);
  const sleep = parseInt(document.getElementById('sleep').value);
  const stress = parseInt(document.getElementById('stress').value);
  const diet = document.getElementById('diet').value;
  const h = parseInt(document.getElementById('height').value) / 100;
  const w = parseInt(document.getElementById('weight').value);
  const bmi = w / (h * h);
  const historyText = document.getElementById('medHistory').value.toLowerCase();

  const recos = [];

  if (smoking !== 'never' && smoking !== 'former') {
    recos.push({ icon: '🚭', title: 'Quit Smoking', desc: 'This is the single highest-impact change you can make. Quitting reduces heart disease risk by up to 50% within 1 year and respiratory risk dramatically.' });
  }

  if (exercise <= 2) {
    recos.push({ icon: '🏃', title: 'Increase Physical Activity', desc: 'Aim for at least 150 minutes of moderate exercise per week. Even 30-minute walks daily reduce diabetes, heart disease, and obesity risk significantly.' });
  }

  if (sleep < 7) {
    recos.push({ icon: '😴', title: 'Improve Sleep Duration', desc: 'Target 7–9 hours per night. Poor sleep is linked to obesity, mental health issues, and cardiovascular disease. Maintain a consistent sleep schedule.' });
  }

  if (stress >= 7) {
    recos.push({ icon: '🧘', title: 'Manage Stress Levels', desc: 'High chronic stress elevates blood pressure and inflammation. Consider mindfulness, yoga, or therapy. Even 10 minutes of daily relaxation helps.' });
  }

  if (diet === 'poor' || diet === 'very_poor' || diet === 'average') {
    recos.push({ icon: '🥗', title: 'Improve Diet Quality', desc: 'Reduce processed foods, increase vegetables, whole grains, and lean protein. A Mediterranean-style diet is especially effective for cardiac and metabolic health.' });
  }

  if (bmi >= 25) {
    recos.push({ icon: '⚖️', title: 'Work Towards Healthy BMI', desc: `Your current BMI is ${bmi.toFixed(1)}. Even a 5–10% reduction in body weight significantly lowers diabetes, hypertension, and joint risk.` });
  }

  if (historyText.includes('vitamin d')) {
    recos.push({ icon: '☀️', title: 'Address Vitamin D Deficiency', desc: 'Vitamin D deficiency affects bone health, immunity, and mood. Get sunlight exposure, eat fatty fish, or consider supplements after consulting your doctor.' });
  }

  if (historyText.includes('b12') || historyText.includes('vitamin b12')) {
    recos.push({ icon: '💊', title: 'Monitor Vitamin B12', desc: 'B12 deficiency can cause fatigue, nerve damage, and mental health issues. Supplement with B12 or increase intake of meat, eggs, and dairy (or fortified foods for vegans).' });
  }

  if (risks.mental_health >= 35) {
    recos.push({ icon: '🧠', title: 'Prioritize Mental Health', desc: 'Your mental health risk is elevated. Consider speaking to a mental health professional, building social connections, and reducing workload where possible.' });
  }

  recos.push({ icon: '🩺', title: 'Schedule Regular Checkups', desc: 'Regular blood tests, blood pressure monitoring, and preventive screenings can catch issues early when they are most treatable.' });

  recos.forEach(r => {
    const item = document.createElement('div');
    item.className = 'reco-item';
    item.innerHTML = `
      <div class="reco-icon">${r.icon}</div>
      <div class="reco-text">
        <div class="reco-title">${r.title}</div>
        <div class="reco-desc">${r.desc}</div>
      </div>
    `;
    recoList.appendChild(item);
  });

  document.getElementById('recoWrap').style.display = 'block';
}

// ──────────────────────────────────────────────
// MAIN ANALYSIS RUNNER
// ──────────────────────────────────────────────
function runAnalysis() {
  if (!medicalDataset) {
    alert('Dataset still loading. Please wait a moment.');
    return;
  }

  const result = calculateRisks(currentTab);
  lastResults = result;

  updateBMILive();
  renderRiskCards(result.risks);
  renderReasoning(result.reasoningSteps);
  renderExplanations(result.risks, result.notesKeywords, result.historyKeywords);
  renderRecommendations(result.risks);

  // Open reasoning panel automatically
  openReasoning();

  // Scroll results into view
  document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ──────────────────────────────────────────────
// TIMELINE TABS
// ──────────────────────────────────────────────
function setTab(years, btn) {
  currentTab = years;
  document.querySelectorAll('.ttab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  if (lastResults) {
    const result = calculateRisks(years);
    lastResults = result;
    renderRiskCards(result.risks);
    renderReasoning(result.reasoningSteps);
    renderExplanations(result.risks, result.notesKeywords, result.historyKeywords);
    renderRecommendations(result.risks);
  }
}

// ──────────────────────────────────────────────
// AI PANEL TOGGLE
// ──────────────────────────────────────────────
function toggleReasoning() {
  const body = document.getElementById('aiReasoningBody');
  const chevron = document.getElementById('aiChevron');
  reasoningOpen = !reasoningOpen;
  body.classList.toggle('open', reasoningOpen);
  chevron.classList.toggle('open', reasoningOpen);
}

function openReasoning() {
  const body = document.getElementById('aiReasoningBody');
  const chevron = document.getElementById('aiChevron');
  reasoningOpen = true;
  body.classList.add('open');
  chevron.classList.add('open');
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await loadDataset();
  bindRanges();
  updateBMILive();
});
