import sys
import json
import spacy

def calculate_priority(text, age):
    try:
        # Load spaCy model (will fail gracefully if not installed properly)
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text.lower())
        tokens = [token.text for token in doc]
    except Exception as e:
        # Fallback to simple split if spaCy hasn't finished downloading yet in background
        tokens = text.lower().split()

    # Severity Table
    severity_table = {
        "chest": 90,
        "pain": 0, # usually paired with chest
        "breathing": 85,
        "difficulty": 0,
        "fever": 40,
        "headache": 30,
        "cough": 35,
        "chills": 20,
        "nausea": 25,
        "dizzy": 40,
        "bleeding": 85
    }

    # Extract match
    matched_symptoms = []
    base_score = 0
    
    # Simple keyword matcher (a proper implementation would use embeddings here)
    if "chest pain" in text.lower():
        base_score += 90
        matched_symptoms.append("chest pain")
    elif "chest" in tokens and "pain" in tokens:
        base_score += 90
        matched_symptoms.append("chest pain")

    if "breathing difficulty" in text.lower() or ("breathing" in tokens and "difficulty" in tokens):
        base_score += 85
        matched_symptoms.append("breathing difficulty")
    elif "shortness of breath" in text.lower():
        base_score += 85
        matched_symptoms.append("breathing difficulty")

    for word, score in severity_table.items():
        if word in tokens and score > 0 and word not in " ".join(matched_symptoms):
            # To avoid double counting chest pain
            if word == "chest" or word == "breathing":
                continue
            base_score += score
            matched_symptoms.append(word)

    # Age Risk Factor
    age_factor = 0
    if age <= 10:
        age_factor = 15
    elif age <= 40:
        age_factor = 5
    elif age <= 60:
        age_factor = 15
    else:
        age_factor = 25

    priority_score = base_score + age_factor

    # Convert score into a priority level
    priority_level = "Low"
    if priority_score >= 180:
        priority_level = "Risky"
    elif priority_score >= 120:
        priority_level = "High"
    elif priority_score >= 60:
        priority_level = "Medium"

    return {
        "matched_symptoms": matched_symptoms,
        "base_score": base_score,
        "age_factor": age_factor,
        "priority_score": priority_score,
        "priority_level": priority_level
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing input JSON payload"}))
        sys.exit(1)

    try:
        data = json.loads(sys.argv[1])
        text = data.get("text", "")
        age = int(data.get("age", 0))

        result = calculate_priority(text, age)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
