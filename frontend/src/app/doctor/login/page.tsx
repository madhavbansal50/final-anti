"use client";

import { motion } from "framer-motion";
import { Stethoscope, ArrowLeft, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to actual backend API here
    // For now we will mock a successful login to route to doctor dashboard
    setTimeout(() => {
      setLoading(false);
      router.push("/doctor/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-neutral-200">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <Link href="/" className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Role Selection
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-3xl w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-400" />
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Doctor Login</h2>
          <p className="text-neutral-400 text-center mb-8">Access the triage management portal</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="doctor@hospital.org"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white font-semibold py-3 rounded-xl mt-6 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
