"use client";

import { motion } from "framer-motion";
import { User, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelection = (role: "Patient" | "Doctor") => {
    if (role === "Patient") {
      router.push("/patient/login");
    } else {
      router.push("/doctor/login");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">TriageAI</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-lg mx-auto">
          Intelligent patient triage and clinical management. Please select your role to continue.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <button
            onClick={() => handleRoleSelection("Patient")}
            className="w-full text-left group relative bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Continue as Patient</h2>
              <p className="text-neutral-400">Submit your symptoms and view reports</p>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <button
            onClick={() => handleRoleSelection("Doctor")}
            className="w-full text-left group relative bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Continue as Doctor</h2>
              <p className="text-neutral-400">Manage patients and view triage priority</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
