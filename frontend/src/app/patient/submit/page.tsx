"use client";

import { motion } from "framer-motion";
import { Activity, Send, FileText, UserCircle, Mic, MicOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Extend Window for vendor-prefixed SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export default function PatientSymptomForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    symptoms: ""
  });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const symptomsBeforeListeningRef = useRef("");

  // Initialize speech recognition on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setFormData((prev) => {
          const base = symptomsBeforeListeningRef.current;
          const separator = base && !base.endsWith(" ") ? " " : "";
          return {
            ...prev,
            symptoms: base + separator + finalTranscript + interimTranscript
          };
        });

        // Update the base text when we get final results
        if (finalTranscript) {
          symptomsBeforeListeningRef.current += (symptomsBeforeListeningRef.current ? " " : "") + finalTranscript.trim();
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Capture current text so we can append to it
      symptomsBeforeListeningRef.current = formData.symptoms;
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, formData.symptoms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/patient/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push("/patient/reports?email=" + encodeURIComponent(formData.email));
      } else {
        alert("Failed to submit symptoms. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6 shadow-xl shadow-blue-500/10">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Symptom Assessment</h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Please provide your details and describe your symptoms. Our AI will analyze the severity and triage you accordingly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Patient Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Age</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="e.g. 45"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="patient@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-400">Describe Your Symptoms</label>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isListening
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30"
                    }`}
                    id="voice-input-btn"
                  >
                    {isListening ? (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <MicOff className="w-4 h-4" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Voice Input
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-4 w-5 h-5 text-neutral-500" />
                <textarea
                  required
                  rows={5}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className={`w-full bg-neutral-950/50 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none ${
                    isListening ? "border-red-500/50 ring-1 ring-red-500/30" : "border-neutral-800"
                  }`}
                  placeholder='Type or use Voice Input — e.g. "I have chest pain and difficulty breathing since morning..."'
                ></textarea>
                {isListening && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-red-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Listening...
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold flex items-center justify-center py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Symptoms <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
