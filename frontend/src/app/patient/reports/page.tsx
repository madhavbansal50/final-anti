"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Activity, FileText, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Report {
  id: string; // from report_id
  priority_level: string;
  priority_score: number;
  report_date: string;
}

export default function PatientReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Note: we are passing email in query params for now as mock auth
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "patient@example.com";

  useEffect(() => {
    fetchReports();
  }, [email]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/patient/reports?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case "Risky": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Low": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-10 relative">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link href="/patient/submit" className="inline-flex items-center text-cyan-500 hover:text-cyan-400 mb-6 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Log Symptoms
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">My Medical Reports</h1>
            </div>
            <p className="text-neutral-400">View your history, priority status, and doctor comments.</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Report ID</th>
                  <th className="py-4 px-6 font-medium">Priority Level</th>
                  <th className="py-4 px-6 font-medium">Triage Score</th>
                  <th className="py-4 px-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-sm">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                      No reports found for {email}
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 px-6 text-neutral-300">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-neutral-500" /> {new Date(r.report_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white font-mono">{r.id}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 bg-opacity-10 border rounded-full text-xs font-semibold ${getPriorityColor(r.priority_level)}`}>
                          {r.priority_level}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <Activity className="w-4 h-4 text-cyan-500/50" />
                           <span className="text-white font-mono">{r.priority_score}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/patient/report/${r.id}`}
                          className="inline-flex items-center justify-center text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-lg transition-colors"
                        >
                          View Report <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
