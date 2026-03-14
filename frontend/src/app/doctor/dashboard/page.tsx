"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, ArrowRight, Activity, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Report {
  report_id: string;
  patient_id: string;
  patient_name: string;
  priority_level: string;
  priority_score: number;
  report_date: string;
}

interface DashboardStats {
  total: number;
  risky: number;
  high: number;
  medium: number;
  low: number;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctor/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPatients(data.patients);
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
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-10 relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Clinical Triage Dashboard</h1>
            </div>
            <p className="text-neutral-400">Real-time patient prioritization overview</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/doctor/ai-assistant" 
              className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-6 py-2.5 rounded-xl transition-all font-medium flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" /> Voice Assistant
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Users className="w-4 h-4" /> Total
            </div>
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-neutral-900 border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-4 h-4" /> Risky
            </div>
            <div className="text-3xl font-bold text-red-400">{stats?.risky || 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900 border border-orange-500/20 bg-orange-500/5 rounded-2xl p-6">
            <div className="text-orange-400 mb-2 font-medium">High Priority</div>
            <div className="text-3xl font-bold text-orange-400">{stats?.high || 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-neutral-900 border border-yellow-500/20 bg-yellow-400/5 rounded-2xl p-6">
            <div className="text-yellow-400 mb-2 font-medium">Medium Priority</div>
            <div className="text-3xl font-bold text-yellow-400">{stats?.medium || 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-neutral-900 border border-green-500/20 bg-green-500/5 rounded-2xl p-6">
            <div className="text-green-400 mb-2 font-medium">Low Priority</div>
            <div className="text-3xl font-bold text-green-400">{stats?.low || 0}</div>
          </motion.div>
        </div>

        {/* Priority List Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="py-4 px-6 font-medium">Patient ID</th>
                  <th className="py-4 px-6 font-medium">Patient Name</th>
                  <th className="py-4 px-6 font-medium">Priority Level</th>
                  <th className="py-4 px-6 font-medium">Priority Score</th>
                  <th className="py-4 px-6 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-sm">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                      No patients in queue
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.report_id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 px-6 text-neutral-300 font-medium">{p.report_id}</td>
                      <td className="py-4 px-6 text-white">{p.patient_name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 bg-opacity-10 border rounded-full text-xs font-semibold ${getPriorityColor(p.priority_level)}`}>
                          {p.priority_level}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-mono">{p.priority_score}</span>
                          <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${p.priority_level === 'Risky' ? 'bg-red-500' : p.priority_level === 'High' ? 'bg-orange-500' : p.priority_level === 'Medium' ? 'bg-yellow-400' : 'bg-green-500'}`} 
                              style={{ width: `${Math.min((p.priority_score / 250) * 100, 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => router.push(`/doctor/report/${p.report_id}`)}
                          className="inline-flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors"
                        >
                          Details <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
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
