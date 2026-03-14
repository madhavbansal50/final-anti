"use client";

import { useEffect, useState, useRef, useCallback, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Calendar, Activity, CheckCircle2, FileText, AlertCircle, Stethoscope, Mic, MicOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export default function DoctorReportView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const responseBeforeListeningRef = useRef("");

  useEffect(() => {
    fetchReport();
  }, [id]);

  // Initialize speech recognition
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

        setResponse((prev) => {
          const base = responseBeforeListeningRef.current;
          const separator = base && !base.endsWith(" ") ? " " : "";
          return base + separator + finalTranscript + interimTranscript;
        });

        if (finalTranscript) {
          responseBeforeListeningRef.current += (responseBeforeListeningRef.current ? " " : "") + finalTranscript.trim();
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
      responseBeforeListeningRef.current = response;
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, response]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/report/${id}`);
      if (res.ok) {
        setReport(await res.json());
      } else {
        alert("Report not found");
        router.push("/doctor/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!response.trim()) return alert("Please enter a doctor response");
    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/report/${id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_response: response })
      });
      if (res.ok) {
        alert("Report finalized.");
        router.push("/doctor/dashboard");
      } else {
        alert("Failed to finalize report.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent flex rounded-full animate-spin" /></div>;
  if (!report) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-10 relative">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/doctor/dashboard" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-indigo-400" /> Report Details
            </h1>
            <p className="text-neutral-400 font-mono">{report.report_id}</p>
          </div>
          
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${
            report.priority_level === 'Risky' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
            report.priority_level === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
            report.priority_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
            'bg-green-500/10 text-green-400 border-green-500/20'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">{report.priority_level} Priority ({report.priority_score})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-3">Patient Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 w-20">Name:</span>
                <span className="text-white font-medium">{report.patient_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 w-20">Email:</span>
                <span className="text-white">{report.patient_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 w-20">Age:</span>
                <span className="text-white">{report.age}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-400 w-20">Date:</span>
                <span className="text-white">{new Date(report.report_date).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-3 flex items-center">
               <Activity className="w-4 h-4 text-indigo-400 mr-2" /> AI Clinical Summary
            </h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              {report.ai_summary}
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-3 flex items-center">
            <Stethoscope className="w-4 h-4 text-indigo-400 mr-2" /> Doctor&apos;s Response &amp; Finalization
          </h3>
          
          {report.doctor_response ? (
            <div className="bg-green-500/5 border border-green-500/20 text-green-400 p-4 rounded-xl flex gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Report Already Finalized</p>
                <p className="text-green-300/80">{report.doctor_response}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Clinical assessment, prescription notes, and prescribed actions</span>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isListening
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                          : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30"
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
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={5}
                    className={`w-full bg-neutral-950 border rounded-xl py-3 px-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none ${
                      isListening ? "border-red-500/50 ring-1 ring-red-500/30" : "border-neutral-800"
                    }`}
                    placeholder="Type or use Voice Input — Enter clinical assessment, prescription notes, and prescribed actions..."
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
              <div className="flex justify-end">
                <button
                  onClick={handleFinalize}
                  disabled={saving || !response.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Finalize Report
                </button>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
