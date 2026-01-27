"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // 1. ดึงค่าโหมดจาก Cookie แบบปลอดภัย (Lazy Initialization)
  const [level, setLevel] = useState(() => {
    if (typeof document !== "undefined") {
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("security_level="))
          ?.split("=")[1] || "low"
      );
    }
    return "low";
  });

  // ฟังก์ชันสลับโหมด (Low <-> High)
  const toggleSecurity = () => {
    const newLevel = level === "low" ? "high" : "low";
    setLevel(newLevel);
    document.cookie = `security_level=${newLevel}; path=/; max-age=3600`;
    setExecutedQuery("");
    setMessage("");
  };

  // ฟังก์ชัน Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setExecutedQuery(data.executedQuery);

      if (res.ok) {
        // ให้เวลา User ดู SQL Success แป๊บนึงก่อนไปหน้าถัดไป
        setTimeout(() => router.push("/user"), 1000);
      } else {
        setMessage(data.message || "Access Denied: Invalid Credentials");
      }
    } catch (error) {
      console.log(error)
      setMessage("System Error: Check Backend Connection");
    }
  };

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans'>
      {/* 🌌 Background Elements (แสงฟุ้งๆ หลังพื้นหลัง) */}
      <div className='fixed top-0 left-0 w-full h-full -z-10'>
        <div className='absolute top-[20%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[120px]'></div>
      </div>

      <div className='w-full max-w-md space-y-8'>
        {/* 📟 Main Login Card (Glassmorphism) */}
        <div className='backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative'>
          <div className='flex justify-between items-start mb-10'>
            <div>
              <h1 className='text-3xl font-black text-white tracking-tighter uppercase'>
                Gateway
              </h1>
              <p className='text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em]'>
                Identity Access Management
              </p>
            </div>
            <button
              onClick={toggleSecurity}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all active:scale-95 border ${
                level === "low"
                  ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                  : "bg-green-500/10 text-green-400 border-green-500/30"
              }`}
            >
              {level.toUpperCase()}
            </button>
          </div>

          <form onSubmit={handleLogin} className='space-y-6'>
            <div className='group'>
              <label className='text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block'>
                Username
              </label>
              <input
                type='text'
                required
                className='w-full bg-black/30 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all'
                placeholder='Enter identifier...'
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className='group'>
              <label className='text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block'>
                Password
              </label>
              <input
                type='password'
                required
                className='w-full bg-black/30 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all'
                placeholder='••••••••'
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type='submit'
              className='w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer mt-4 uppercase tracking-widest text-sm'
            >
              Authenticate
            </button>
          </form>

          {message && (
            <div className='mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center'>
              ⚠️ {message}
            </div>
          )}
        </div>

        {/* 🖥️ SQL Execution Log (Console Style) */}
        {executedQuery && (
          <div className='backdrop-blur-md bg-black/60 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center'>
              <span className='text-[10px] font-bold text-blue-400 uppercase tracking-widest'>
                Backend Command Log
              </span>
              <div className='flex gap-1'>
                <div className='w-1.5 h-1.5 rounded-full bg-blue-500/50'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-blue-500/30'></div>
              </div>
            </div>
            <div className='p-6 font-mono text-sm leading-relaxed flex gap-3 items-start'>
              <span className='text-blue-500 font-bold shrink-0'>❯</span>
              <code className='text-green-400 break-all'>{executedQuery}</code>
            </div>
          </div>
        )}

        <p className='text-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]'>
          Authorized Personnel Only • Secure Session v2.4
        </p>
      </div>
    </div>
  );
}
