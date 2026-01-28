"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [securityLevel, setSecurityLevel] = useState("low");
  const [isMounted, setIsMounted] = useState(false);

  // ✅ 1. Hydration Guard: ตั้งค่าเริ่มต้นเมื่อ Mounted บน Browser แล้วเท่านั้น
  useEffect(() => {
    const initLab = () => {
      setIsMounted(true);
      const savedLevel = document.cookie
        .split("; ")
        .find((row) => row.startsWith("security_level="))
        ?.split("=")[1];
      if (savedLevel) setSecurityLevel(savedLevel);

      console.log(
        "%c 🚀 Security Lab Initialized: System Ready ",
        "background: #1e293b; color: #38bdf8; font-weight: bold; padding: 5px; border-radius: 4px;",
      );
    };

    const timer = setTimeout(initLab, 0);
    return () => clearTimeout(timer);
  }, []);

  // ✅ 2. Real-time SQL Log + Debounce Fix
  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users?name=${searchTerm}`);
        const data = await res.json();

        // 🔥 FIX: อัปเดต SQL Log เสมอไม่ว่าจะ Status 200 หรือ 500
        if (data.executedQuery) {
          setExecutedQuery(data.executedQuery);
        }

        if (res.ok) {
          setUsers(data.users || []);
        } else {
          setUsers([]); // ถ้าพัง (SQL Error) ให้ล้างตารางทิ้ง
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    // ⏱️ Debounce: รอให้หยุดพิมพ์ 300ms ค่อยยิง API (ช่วยให้ระบบลื่นไหลขึ้น)
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, securityLevel, isMounted]);

  const toggleSecurity = () => {
    const newLevel = securityLevel === "low" ? "high" : "low";
    setSecurityLevel(newLevel);
    document.cookie = `security_level=${newLevel}; Path=/; max-age=3600`;
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.replace("/login");
  };

  if (!isMounted) return null;

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-slate-200 p-4 md:p-8 relative overflow-hidden font-sans'>
      {/* 🌌 Background Glows */}
      <div className='fixed top-0 left-0 w-full h-full -z-10'>
        <div className='absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]'></div>
      </div>

      <div className='max-w-5xl mx-auto space-y-6'>
        {/* 📟 Header Section (Glassmorphism) */}
        <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20'>
              📁
            </div>
            <div>
              <h1 className='text-3xl font-black tracking-tight text-white uppercase'>
                Security Lab
              </h1>
              <p className='text-xs font-mono text-blue-500 uppercase tracking-widest'>
                Identity Access Management
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5'>
            <button
              onClick={toggleSecurity}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                securityLevel === "low"
                  ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                  : "bg-green-500/10 text-green-400 border-green-500/30"
              }`}
            >
              MODE: {securityLevel.toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className='px-6 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all'
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🕵️ Live SQL Viewer (Terminal Style) */}
        <div className='backdrop-blur-md bg-black/40 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative'>
          <div className='bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center'>
            <span className='text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]'>
              Executed SQL Query (Backend Log)
            </span>
            <div className='flex gap-1.5'>
              <div className='w-2 h-2 rounded-full bg-red-500/50'></div>
              <div className='w-2 h-2 rounded-full bg-yellow-500/50'></div>
              <div className='w-2 h-2 rounded-full bg-green-500/50'></div>
            </div>
          </div>
          <div className='p-6 font-mono text-lg leading-relaxed flex items-start'>
            <span className='text-blue-500 mr-3 shrink-0'>❯</span>
            <code className='text-green-400 break-all'>
              {executedQuery || "Waiting for system command..."}
            </code>
          </div>
        </div>

        {/* 🔍 Search Area & Data Table */}
        <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl'>
          <div className='relative mb-10 group'>
            <input
              type='text'
              placeholder='Try: admin" OR "1"="1" -- หรือ ORDER BY...'
              className='w-full bg-black/20 border-2 border-white/5 rounded-2xl py-5 px-6 text-white text-lg placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner'
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className='absolute right-6 top-5 text-blue-500/30 group-hover:text-blue-500 transition-colors'>
              🔎
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-separate border-spacing-y-3'>
              <thead>
                <tr className='text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]'>
                  <th className='pb-4 px-4 text-left'>Identity ID</th>
                  <th className='pb-4 px-4 text-left'>Subject Name</th>
                  <th className='pb-4 px-4 text-left'>Access Level</th>
                  <th className='pb-4 px-4 text-right'>System Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={`${user.id}-${index}`}
                    className='group bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300'
                  >
                    <td className='py-5 px-4 rounded-l-2xl font-mono text-blue-500/50 group-hover:text-blue-400'>
                      #{user.id}
                    </td>
                    <td className='py-5 px-4 font-bold text-white'>
                      {user.username}
                    </td>
                    <td className='py-5 px-4'>
                      <span
                        className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-tighter border ${
                          user.role === "admin" || user.role === "administrator"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className='py-5 px-4 text-right rounded-r-2xl'>
                      <Link
                        href={`/user/${user.id}`}
                        className='inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg border border-white/10 hover:border-blue-500'
                      >
                        Profile <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className='text-center py-24 bg-black/10 rounded-[2rem] border border-dashed border-white/5'>
              <div className='text-4xl mb-4 opacity-20'>📡</div>
              <p className='text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse'>
                Scanning database... No data records found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
