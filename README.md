# Final Anti - AI Clinic Project

This repository contains the Full Stack "NeoClinic" AI Assistant Application. The application is designed to aid doctors by providing AI-powered clinic features, symptom extraction (via NLP/voice-to-text models), and comprehensive doctor reports.

## Architecture

The project is divided into three main modules:
- **`frontend/`**: The user interface built with **Next.js**, React, TailwindCSS, and Framer Motion.
- **`backend/`**: A RESTful API built with **Node.js, Express, and SQLite/Mongoose** handling authentication, form submissions, and database connectivity.
- **`nlp/`**: Python-based services for natural language processing, symptom extraction, and integrations.

## Prerequisites

- **Node.js**: v18 or later
- **Python**: v3.8+ (for NLP engine)

## Running Locally

### 1. Start the Backend server
Navigate to the `backend` folder and start the API server:
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend server
Navigate to the `frontend` folder and start the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```

### 3. NLP Service (If applicable)
Navigate to the `nlp` folder, set up your Python environment, and execute the processing script if needed for AI-assisted symptom processing.
```bash
cd nlp
# Activate venv if exists
python process_symptoms.py
```

## Features

- **Voice-to-Text Integration:** Allows patients to speak their symptoms which are transcribed automatically.
- **Doctor AI Assistant:** Gives AI-driven insights for doctor consultations.
- **Doctor Report Generation:** Automated transcription and report creation for the doctors.

## Contributors
- [@madhavbansal50](https://github.com/madhavbansal50)
