/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [securityLevel, setSecurityLevel] = useState("low");

  useEffect(() => {
    setIsMounted(true);
    // ดึงโหมดจากคุกกี้มาตั้งต้น
    const savedLevel = document.cookie
      .split("; ")
      .find((row) => row.startsWith("security_level="))
      ?.split("=")[1];
    if (savedLevel) setSecurityLevel(savedLevel);

    const isLoggedIn = document.cookie.includes("isLoggedIn=true");
    if (isLoggedIn) {
      window.location.replace("/user");
    }
  }, []);

  const toggleSecurity = () => {
    const newLevel = securityLevel === "low" ? "high" : "low";
    setSecurityLevel(newLevel);
    document.cookie = `security_level=${newLevel}; Path=/; max-age=3600`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setExecutedQuery("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.executedQuery) setExecutedQuery(data.executedQuery);

      if (res.ok) {
        setTimeout(() => window.location.replace("/user"), 1000);
      } else {
        setMessage(data.message || data.error || "Access Denied");
      }
    } catch (err) {
      setMessage("Connection Error");
    }
  };

  if (!isMounted) return null;

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans'>
      {/* 🚨 Vulnerability Warning Bar (Marquee) */}
      {securityLevel === "low" && (
        <div className='fixed top-0 left-0 w-full z-[100] bg-red-600/20 backdrop-blur-md border-b border-red-500/50 py-1 overflow-hidden pointer-events-none'>
          <div className='flex whitespace-nowrap animate-marquee gap-8 items-center'>
            {[...Array(10)].map((_, i) => (
              <div key={i} className='flex items-center gap-4'>
                <span className='text-red-500 text-[9px] font-black tracking-[0.3em] uppercase animate-pulse'>
                  ⚠️ CRITICAL: UNAUTHORIZED BYPASS RISK - SQL INJECTION
                  VULNERABLE
                </span>
                <span className='text-red-500/30 font-mono text-[8px]'>
                  [LOGIN_GATEWAY_EXPOSED]
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌌 Background Glows */}
      <div className='fixed top-0 left-0 w-full h-full -z-10'>
        <div className='absolute top-[20%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[120px]'></div>
      </div>

      <div className='w-full max-w-md space-y-8'>
        {/* Security Toggle */}
        <div className='flex justify-center'>
          <button
            onClick={toggleSecurity}
            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] transition-all border shadow-lg ${
              securityLevel === "low"
                ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}
          >
            SECURITY LEVEL: {securityLevel.toUpperCase()}
          </button>
        </div>

        <div className='backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative'>
          <div className='text-center mb-10'>
            <h1 className='text-4xl font-black text-white tracking-tighter uppercase mb-2'>
              Gateway
            </h1>
            <p className='text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em]'>
              Identity Access Management
            </p>
          </div>

          {message && (
            <div className='mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-pulse'>
              ⚠️ {message}
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-6'>
            <input
              type='text'
              className='w-full bg-black/30 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all'
              placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type='password'
              className='w-full bg-black/30 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all'
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type='submit'
              className='w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold uppercase text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all'
            >
              Authenticate
            </button>
          </form>
        </div>

        {/* SQL Log */}
        {executedQuery && (
          <div className='backdrop-blur-md bg-black/60 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center text-[10px] font-bold text-blue-400 uppercase tracking-widest'>
              Backend Command Log
            </div>
            <div className='p-6 font-mono text-sm leading-relaxed flex gap-3 items-start'>
              <span className='text-blue-500 font-bold shrink-0'>❯</span>
              <code className='text-green-400 break-all'>{executedQuery}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
