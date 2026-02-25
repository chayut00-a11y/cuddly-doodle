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
  const [showInfo, setShowInfo] = useState(false);

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

  const codeSnippets = {
    low: `// 🔴 MODE: LOW (Vulnerable)
query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
user = await db.get(query);`,
    high: `// 🟢 MODE: HIGH (Secure)
query = "SELECT * FROM users WHERE username = ? AND password = ?";
user = await db.get(query, [username, password]);`,
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
        <div className='flex justify-center gap-4'>
          <button
            key={`security-${securityLevel}`} // บังคับให้เบราว์เซอร์ล้างสถานะเก่าแล้ววาดใหม่ทุกครั้งที่เปลี่ยนโหมด
            onClick={toggleSecurity}
            className={`relative flex items-center justify-center px-4 py-2.5 rounded-full border transition-all duration-300 shadow-lg group overflow-hidden ${
              securityLevel === "low"
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {/* ส่วนของไฟกระพริบ (แยกออกจากตัวหนังสือเพื่อไม่ให้ตัวหนังสือสั่นจนซ้อน) */}
            {securityLevel === "low" && (
              <div className='absolute inset-0 bg-red-500/5 animate-pulse'></div>
            )}

            <div className='relative flex items-center gap-2 font-mono'>
              <div
                className={`w-1.5 h-1.5 rounded-full ${securityLevel === "low" ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}
              ></div>

              {/* ข้อความ: ล็อกความกว้างขั้นต่ำ (min-w) เพื่อไม่ให้ตัวหนังสือเบียดกัน */}
              <span className='text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap min-w-[100px] sm:min-w-[140px] text-center'>
                {isMounted ? (
                  <>
                    <span className='hidden sm:inline'>SECURITY LEVEL: </span>
                    <span className='sm:hidden'>SEC: </span>
                    {securityLevel.toUpperCase()}
                  </>
                ) : (
                  "LOADING..."
                )}
              </span>
            </div>
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className='w-10 h-10 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-110 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
          >
            <span className='font-mono font-bold'>i</span>
          </button>
        </div>

        {showInfo && (
          <div className='fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-500'>
            {/* 🌌 Background Overlay (ปรับให้โปร่งขึ้นและเบลอฉากหลังมากขึ้น) */}
            <div
              className='absolute inset-0 bg-black/40 backdrop-blur-md' // <-- แก้จาก bg-black/80 เป็น /40 และเพิ่ม blur-md
              onClick={() => setShowInfo(false)}
            ></div>

            {/* 📋 Modal Content (พระเอกของเรา: กระจกฝ้าโปร่งแสง) */}
            <div className='relative w-full max-w-2xl bg-[#0d1117]/70 backdrop-blur-2xl border border-blue-500/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300'>
              {/* ^-- จุดแก้สำคัญ:
          1. bg-[#0d1117]/70 : เพิ่ม opacity 70% ให้สีพื้นหลัง
          2. backdrop-blur-2xl : เพิ่มการเบลอระดับสูงสุดเพื่อให้ดูเหมือนกระจกหนาๆ
          3. rounded-[2.5rem] : เพิ่มความโค้งมนให้ดูทันสมัยขึ้นเข้ากับกระจก
      */}

              {/* Header ของ Popup */}
              <div className='bg-blue-500/10 px-6 py-4 border-b border-white/10 flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <div className='flex gap-1.5'>
                    {/* ปรับปุ่มให้ดูใสขึ้นนิดหน่อย */}
                    <div className='w-3 h-3 rounded-full bg-red-500/60'></div>
                    <div className='w-3 h-3 rounded-full bg-yellow-500/60'></div>
                    <div className='w-3 h-3 rounded-full bg-green-500/60'></div>
                  </div>
                  <span className='text-[10px] font-mono text-blue-400/90 uppercase tracking-[0.2em]'>
                    System_Logic_Viewer v1.0
                  </span>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all'
                >
                  ✕
                </button>
              </div>

              {/* Code Display Area */}
              <div className='p-8'>
                <div className='mb-5 flex items-center justify-between'>
                  <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                    Backend Implementation:{" "}
                    <span
                      className={
                        securityLevel === "low"
                          ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                          : "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      }
                    >
                      {securityLevel.toUpperCase()}
                    </span>
                  </h3>
                  <span className='text-[9px] font-mono text-slate-500/80'>
                    app/api/login/route.js
                  </span>
                </div>

                <div className='relative group'>
                  {/* ปรับพื้นหลังส่วนแสดงโค้ดให้โปร่งแสงตาม */}
                  <pre className='p-6 bg-black/40 rounded-3xl font-mono text-xs leading-relaxed text-blue-100 border border-white/10 overflow-x-auto shadow-inner'>
                    {/* ^-- จุดแก้: ใช้ bg-black/40 และเพิ่มความโค้งมน */}
                    <code>
                      {securityLevel === "low"
                        ? `// 🔴 MODE: LOW (ต่อ String ตรงๆ)
const query = \`SELECT * FROM users
               WHERE username = '\${username}'
               AND password = '\${password}'\`;

// ⚠️ ผลลัพธ์: โดน SQL Injection ได้ง่ายๆ`
                        : `// 🟢 MODE: HIGH (ใช้ Prepared Statements)
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
const user = await db.get(query, [username, password]);

// ✅ ผลลัพธ์: ปลอดภัย 100%`}
                    </code>
                  </pre>
                </div>

                {/* 💡 Hint สำหรับผู้เล่น */}
                <div className='mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl'>
                  <p className='text-[11px] text-blue-300/80 italic leading-relaxed'>
                    {securityLevel === "low"
                      ? "💡 Hint: ลองใช้รหัสผ่านเป็น ' OR 1=1 -- เพื่อทำการบายพาสการตรวจสอบ"
                      : "💡 Info: ระบบจะแยก 'ข้อมูล' ออกจาก 'คำสั่ง' ทำให้แฮกเกอร์แทรกคำสั่งเพิ่มไม่ได้"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
