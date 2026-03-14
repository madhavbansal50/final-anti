"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Square, Loader2, ArrowLeft, Stethoscope, Table2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export default function DoctorAIAssistant() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

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
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += result + " ";
          } else {
            interimTranscript += result;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += (transcriptRef.current ? " " : "") + finalTranscript.trim();
        }

        setTranscript(transcriptRef.current + (interimTranscript ? " " + interimTranscript : ""));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    transcriptRef.current = "";
    setTranscript("");
    setSummaryData(null);
    recognitionRef.current.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    // Wait a moment for final transcript to settle
    await new Promise((r) => setTimeout(r, 300));

    const finalText = transcriptRef.current.trim();
    if (!finalText) {
      alert("No speech detected. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // Send transcribed text to the AI whisper endpoint for summarization
      const formData = new FormData();
      const audioBlob = new Blob([finalText], { type: "text/plain" });
      formData.append("audio", audioBlob, "recording.txt");

      const res = await fetch("http://localhost:5000/api/ai/whisper", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setSummaryData(data);
    } catch (error) {
      console.error("AI summarization failed", error);
      // Fallback: show the transcribed text as a summary
      setSummaryData({
        summary: finalText,
        points: [
          { topic: "Transcribed Speech", details: finalText }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-10 relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/doctor/dashboard" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Mic className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Voice Assistant</h1>
            <p className="text-neutral-400">Record patient consultations to automatically extract key clinical points.</p>
          </div>
        </div>

        <div className="flex flex-col items-center mb-12">
          {/* Record Button */}
          <div className="flex justify-center mb-6">
            {!isRecording ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                disabled={loading || !speechSupported}
                className="w-32 h-32 bg-neutral-900 border-2 border-indigo-500/50 rounded-full flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-500/10 transition-all group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />}
                <span className="font-medium text-sm">{loading ? "Processing..." : "Tap to Record"}</span>
              </motion.button>
            ) : (
               <motion.button 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="w-32 h-32 bg-red-500/10 border-2 border-red-500 rounded-full flex flex-col items-center justify-center text-red-500 transition-all group relative"
              >
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <Square className="w-8 h-8 mb-2 fill-current relative z-10" />
                <span className="font-medium text-sm relative z-10">Stop Recording</span>
              </motion.button>
            )}
          </div>

          {/* Live Transcript */}
          {(isRecording || transcript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                {isRecording && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <span className="text-sm font-medium text-neutral-400">
                  {isRecording ? "Live Transcription..." : "Transcription Complete"}
                </span>
              </div>
              <p className="text-neutral-200 text-sm leading-relaxed">
                {transcript || <span className="text-neutral-600 italic">Start speaking...</span>}
              </p>
            </motion.div>
          )}

          {!speechSupported && (
            <p className="text-yellow-500 text-sm mt-4">⚠️ Voice recognition is not supported in this browser. Use Chrome or Edge.</p>
          )}
        </div>

        {summaryData && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
               <Stethoscope className="w-5 h-5 text-indigo-400" />
               <h3 className="text-xl font-bold text-white">Structured Consultation Summary</h3>
             </div>
             
             <p className="text-neutral-300 text-sm mb-6 bg-neutral-950 p-4 rounded-xl border border-neutral-800/50">
               {summaryData.summary}
             </p>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 border-y border-neutral-800 text-indigo-300 text-sm font-semibold">
                      <th className="py-3 px-5 flex items-center gap-2"><Table2 className="w-4 h-4" /> Discussion Topic</th>
                      <th className="py-3 px-5">Extracted Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50 text-sm">
                    {summaryData.points?.map((pt: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="py-4 px-5 text-neutral-300 font-medium w-1/3">{pt.topic}</td>
                        <td className="py-4 px-5 text-white">{pt.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
