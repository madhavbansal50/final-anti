/**
 * Dynamic Medical Triage Priority Engine
 * 
 * Scoring-based priority system with:
 * - Age scoring
 * - Symptom severity classification (keyword-based)
 * - Waiting time scoring
 * - Weighted priority formula
 * - Automatic time-based escalation
 * - Queue ordering
 */

// ─── STEP 1: Age Scoring ─────────────────────────────────────────────────────

function getAgeScore(age) {
  age = Number(age) || 0;
  if (age <= 5) return 4;
  if (age <= 18) return 2;
  if (age <= 40) return 1;
  if (age <= 60) return 3;
  return 5; // 60+
}

// ─── STEP 2: Symptom Severity Classification ─────────────────────────────────

const SYMPTOM_DICTIONARY = {
  CRITICAL: {
    score: 10,
    keywords: [
      'heart attack',
      'stroke',
      'unconscious',
      'severe bleeding',
      'cardiac arrest',
      'seizure',
      'not breathing',
      'unresponsive',
      'anaphylaxis',
      'collapsed'
    ]
  },
  SEVERE: {
    score: 8,
    keywords: [
      'chest pain',
      'breathing difficulty',
      'shortness of breath',
      'severe injury',
      'high fever',
      'blood in stool',
      'blood in urine',
      'severe headache',
      'difficulty breathing',
      'heavy bleeding',
      'fracture',
      'broken bone',
      'paralysis',
      'blurred vision'
    ]
  },
  MODERATE: {
    score: 5,
    keywords: [
      'fever',
      'vomiting',
      'stomach pain',
      'dizziness',
      'dehydration',
      'nausea',
      'abdominal pain',
      'back pain',
      'joint pain',
      'swelling',
      'rash',
      'infection',
      'diarrhea',
      'chills',
      'muscle pain',
      'ear pain',
      'eye pain'
    ]
  },
  MILD: {
    score: 2,
    keywords: [
      'cold',
      'cough',
      'headache',
      'sore throat',
      'fatigue',
      'runny nose',
      'sneezing',
      'mild pain',
      'itching',
      'insomnia',
      'allergy',
      'congestion',
      'bruise'
    ]
  }
};

function getSymptomScore(symptoms) {
  if (!symptoms || typeof symptoms !== 'string') return 5; // Default moderate

  const text = symptoms.toLowerCase();
  let highestScore = 0;
  let matchedKeywords = [];
  let severity = 'UNKNOWN';

  // Check each severity tier, prioritizing higher tiers
  for (const [level, { score, keywords }] of Object.entries(SYMPTOM_DICTIONARY)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matchedKeywords.push(keyword);
        if (score > highestScore) {
          highestScore = score;
          severity = level;
        }
      }
    }
  }

  // Default to MODERATE (5) if no keywords matched
  if (highestScore === 0) {
    return 5;
  }

  return highestScore;
}

// Also export a detailed version for logging/debugging
function getSymptomAnalysis(symptoms) {
  if (!symptoms || typeof symptoms !== 'string') {
    return { score: 5, severity: 'MODERATE', matchedKeywords: [], isDefault: true };
  }

  const text = symptoms.toLowerCase();
  let highestScore = 0;
  let matchedKeywords = [];
  let severity = 'MODERATE';

  for (const [level, { score, keywords }] of Object.entries(SYMPTOM_DICTIONARY)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matchedKeywords.push({ keyword, level, score });
        if (score > highestScore) {
          highestScore = score;
          severity = level;
        }
      }
    }
  }

  return {
    score: highestScore || 5,
    severity: highestScore === 0 ? 'MODERATE' : severity,
    matchedKeywords,
    isDefault: highestScore === 0
  };
}

// ─── STEP 3: Waiting Time Score ──────────────────────────────────────────────

function getWaitingScore(registrationTime) {
  if (!registrationTime) return 1;

  const regTime = new Date(registrationTime).getTime();
  const now = Date.now();
  const minutesWaited = (now - regTime) / (1000 * 60);

  if (minutesWaited < 10) return 1;
  if (minutesWaited <= 30) return 2;
  if (minutesWaited <= 60) return 3;
  if (minutesWaited <= 120) return 4;
  return 5; // > 2 hours
}

// ─── STEP 4: Priority Score Formula ──────────────────────────────────────────

function calculatePriority(patient) {
  const symptomScore = getSymptomScore(patient.symptoms || patient.ai_summary || '');
  const ageScore = getAgeScore(patient.age);
  const waitingScore = getWaitingScore(patient.report_date || patient.registrationTime);

  // Weighted formula: symptoms have the highest weight
  const priorityScore = (0.5 * symptomScore) + (0.3 * ageScore) + (0.2 * waitingScore);

  return {
    priorityScore: Math.round(priorityScore * 100) / 100, // Round to 2 decimals
    symptomScore,
    ageScore,
    waitingScore
  };
}

// ─── STEP 5: Priority Level Classification ───────────────────────────────────

function getPriorityLevel(score) {
  if (score > 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

// ─── STEP 6: Automatic Priority Escalation ───────────────────────────────────

function updatePriorityWithTime(patient) {
  const symptoms = patient.symptoms || patient.ai_summary || '';
  const symptomScore = getSymptomScore(symptoms);
  const registrationTime = patient.report_date || patient.registrationTime;

  // Calculate current priority
  const { priorityScore } = calculatePriority(patient);
  let priorityLevel = getPriorityLevel(priorityScore);

  // Critical symptoms → always HIGH immediately
  if (symptomScore >= 10) {
    return {
      priorityScore,
      priorityLevel: 'HIGH',
      escalated: priorityLevel !== 'HIGH',
      escalationReason: 'Critical symptoms detected'
    };
  }

  // Time-based escalation
  if (registrationTime) {
    const regTime = new Date(registrationTime).getTime();
    const hoursWaited = (Date.now() - regTime) / (1000 * 60 * 60);

    let escalated = false;
    let escalationReason = null;

    // ≥ 3 hours → force HIGH regardless
    if (hoursWaited >= 3) {
      if (priorityLevel !== 'HIGH') {
        escalated = true;
        escalationReason = `Forced HIGH: patient waiting ${Math.floor(hoursWaited)}h+`;
      }
      priorityLevel = 'HIGH';
    }
    // ≥ 2 hours AND MEDIUM → upgrade to HIGH
    else if (hoursWaited >= 2 && priorityLevel === 'MEDIUM') {
      priorityLevel = 'HIGH';
      escalated = true;
      escalationReason = `Escalated MEDIUM→HIGH: waiting ${Math.floor(hoursWaited)}h+`;
    }
    // ≥ 1 hour AND LOW → upgrade to MEDIUM
    else if (hoursWaited >= 1 && priorityLevel === 'LOW') {
      priorityLevel = 'MEDIUM';
      escalated = true;
      escalationReason = `Escalated LOW→MEDIUM: waiting ${Math.floor(hoursWaited)}h+`;
    }

    return { priorityScore, priorityLevel, escalated, escalationReason };
  }

  return { priorityScore, priorityLevel, escalated: false, escalationReason: null };
}

// ─── STEP 8: Queue Ordering ──────────────────────────────────────────────────

const LEVEL_ORDER = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

function sortPatientQueue(patients) {
  return [...patients].sort((a, b) => {
    // 1. Priority level (HIGH > MEDIUM > LOW)
    const levelDiff = (LEVEL_ORDER[b.priority_level] || 0) - (LEVEL_ORDER[a.priority_level] || 0);
    if (levelDiff !== 0) return levelDiff;

    // 2. Priority score (higher first)
    const scoreDiff = (b.priority_score || 0) - (a.priority_score || 0);
    if (scoreDiff !== 0) return scoreDiff;

    // 3. Registration time (older first — FIFO within same score)
    const aTime = new Date(a.report_date || 0).getTime();
    const bTime = new Date(b.report_date || 0).getTime();
    return aTime - bTime;
  });
}

// ─── Combined triage function (replaces runNlpScript) ────────────────────────

function triagePatient(symptoms, age, registrationTime = null) {
  const symptomAnalysis = getSymptomAnalysis(symptoms);
  const ageScore = getAgeScore(age);
  const waitingScore = getWaitingScore(registrationTime);

  const priorityScore = (0.5 * symptomAnalysis.score) + (0.3 * ageScore) + (0.2 * waitingScore);
  const roundedScore = Math.round(priorityScore * 100) / 100;
  let priorityLevel = getPriorityLevel(roundedScore);

  // Critical symptoms → immediate HIGH
  if (symptomAnalysis.severity === 'CRITICAL') {
    priorityLevel = 'HIGH';
  }

  return {
    priority_score: roundedScore,
    priority_level: priorityLevel,
    symptom_score: symptomAnalysis.score,
    symptom_severity: symptomAnalysis.severity,
    matched_symptoms: symptomAnalysis.matchedKeywords.map(k => k.keyword),
    age_score: ageScore,
    waiting_score: waitingScore
  };
}

module.exports = {
  getAgeScore,
  getSymptomScore,
  getSymptomAnalysis,
  getWaitingScore,
  calculatePriority,
  getPriorityLevel,
  updatePriorityWithTime,
  sortPatientQueue,
  triagePatient,
  SYMPTOM_DICTIONARY,
  LEVEL_ORDER
};
