"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Calendar, Activity, CheckCircle2, FileText, AlertCircle, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PatientReportView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      // Re-using doctor's get route here for reading. Or creating a generic one.
      const res = await fetch(`http://localhost:5000/api/doctor/report/${id}`);
      if (res.ok) {
        setReport(await res.json());
      } else {
        alert("Report not found");
        router.push("/patient/reports");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent flex rounded-full animate-spin" /></div>;
  if (!report) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-10 relative">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href={`/patient/reports?email=${encodeURIComponent(report.patient_email)}`} className="inline-flex items-center text-cyan-500 hover:text-cyan-400 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Reports
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-cyan-400" /> Triage Report Summary
            </h1>
            <p className="text-neutral-400 font-mono">Report ID: {report.report_id}</p>
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
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-3 flex items-center">
               <Activity className="w-4 h-4 text-cyan-400 mr-2" /> Medical Summary
            </h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              {report.ai_summary}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
             <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Visit Details</h3>
              <div className="flex items-center justify-between text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Date Logged:</span>
                <span className="text-white">{new Date(report.report_date).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Patient:</span>
                <span className="text-white">{report.patient_name} (Age {report.age})</span>
              </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-neutral-800 pb-3 flex items-center">
            <Stethoscope className="w-4 h-4 text-cyan-400 mr-2" /> Doctor's Final Response
          </h3>
          
          {report.doctor_response ? (
            <div className="bg-cyan-500/5 border border-cyan-500/20 text-cyan-300 p-5 rounded-xl flex gap-3 text-sm leading-relaxed">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <p>{report.doctor_response}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex w-12 h-12 bg-neutral-800 rounded-full items-center justify-center mb-3">
                 <Activity className="w-6 h-6 text-neutral-500" />
              </div>
              <p className="text-neutral-500 text-sm">Awaiting clinical review. Your doctor will update this section.</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
