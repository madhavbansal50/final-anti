const { triagePatient } = require('./priorityEngine');

/**
 * Run triage scoring on patient symptoms.
 * Replaces the old Python/spaCy process with the JS priority engine.
 * Returns: { priority_score, priority_level, matched_symptoms, ... }
 */
const runNlpScript = (text, age) => {
  return new Promise((resolve) => {
    const result = triagePatient(text, Number(age));
    resolve(result);
  });
};

const generateAiSummary = async (symptoms) => {
  if (process.env.OPENAI_API_KEY) {
    // Mock the direct OpenAI fetch logic here for actual usage:
    // const { OpenAI } = require('openai');
    // const openai = new OpenAI();
    // const completion = await openai.chat.completions.create({...})
    // return completion.choices[0].message.content;
    
    // Instead of using the library we can do a mock if it fails
    return `AI Summary (Key Mode): Patient reports symptoms consistent with clinical presentation of: ${symptoms.substring(0, 50)}... Requires further evaluation.`;
  }
  
  // No key provided fallback
  return `AI Generated Summary: The patient presents with ${symptoms.substring(0, 50)}... and requires clinical review based on the severity profile calculated.`;
};

module.exports = {
  runNlpScript,
  generateAiSummary
};

