"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [securityLevel, setSecurityLevel] = useState("low");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const initLab = () => {
      setIsMounted(true);
      const savedLevel = document.cookie
        .split("; ")
        .find((row) => row.startsWith("security_level="))
        ?.split("=")[1];
      if (savedLevel) setSecurityLevel(savedLevel);

      console.log(
        "%c 🚀 Initializing Lab: Loading all users... ",
        "background: #1e293b; color: #38bdf8; font-weight: bold; padding: 5px;",
      );
    };

    const timer = setTimeout(initLab, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users?name=${searchTerm}`);
        const data = await res.json();

        // ✅ แก้จุดนี้: ย้ายออกมาไว้นอก if (res.ok)
        // เพื่อให้หน้าจอแสดง Query ที่ส่งไปเสมอ ไม่ว่าจะรันผ่านหรือพัง
        if (data.executedQuery) {
          setExecutedQuery(data.executedQuery);
        }

        if (res.ok) {
          setUsers(data.users || []);
        } else {
          // ❌ ถ้าพัง (เช่น SQL Error) ให้ล้างรายชื่อผู้ใช้ทิ้ง
          setUsers([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [searchTerm, securityLevel, isMounted]);

  const toggleSecurity = () => {
    const newLevel = securityLevel === "low" ? "high" : "low";
    console.log(
      `%c 🛡️ [SECURITY UPDATE] Mode: ${newLevel.toUpperCase()} `,
      `background: ${newLevel === "low" ? "#ff4d4f" : "#52c41a"}; color: white; padding: 5px; border-radius: 4px; font-weight: bold;`,
    );
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
        {/* 📟 Header Section */}
        <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20'>
              📁
            </div>
            <div>
              <h1 className='text-3xl font-black tracking-tight text-white leading-tight'>
                Security Lab
              </h1>
              <p className='text-xs font-mono text-blue-500 uppercase tracking-widest'>
                User Directory System
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5'>
            <button
              onClick={toggleSecurity}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                securityLevel === "low"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                  : "bg-green-500 text-white shadow-lg shadow-green-500/30"
              }`}
            >
              MODE: {securityLevel.toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className='px-6 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer'
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🕵️ Live SQL Viewer (Terminal Style) */}
        <div className='backdrop-blur-md bg-black/40 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl'>
          <div className='bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center'>
            <span className='text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]'>
              Executed SQL Query (Backend)
            </span>
            <div className='flex gap-1.5'>
              <div className='w-2 h-2 rounded-full bg-red-500/50'></div>
              <div className='w-2 h-2 rounded-full bg-yellow-500/50'></div>
              <div className='w-2 h-2 rounded-full bg-green-500/50'></div>
            </div>
          </div>
          <div className='p-6 font-mono text-lg leading-relaxed'>
            <span className='text-blue-500 mr-3'>❯</span>
            <code className='text-green-400 break-all'>
              {executedQuery || "Listening for database commands..."}
            </code>
          </div>
        </div>

        {/* 🔍 Interactive Search Area */}
        <div className='backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl'>
          <div className='relative mb-10 group'>
            <input
              type='text'
              placeholder='Inject SQL payloads here in LOW mode...'
              className='w-full bg-black/20 border-2 border-white/5 rounded-2xl py-5 px-6 text-white text-lg placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner'
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className='absolute right-6 top-5 text-blue-500/30 group-hover:text-blue-500 transition-colors'>
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/5 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]'>
                  <th className='py-4 px-4 text-left'>UID</th>
                  <th className='py-4 px-4 text-left'>Identity</th>
                  <th className='py-4 px-4 text-left'>Permission</th>
                  <th className='py-4 px-4 text-right'>Operation</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/[0.03]'>
                {users.map((user, index) => (
                  <tr
                    key={`${user.id}-${index}`}
                    className='group hover:bg-white/[0.02] transition-colors'
                  >
                    <td className='py-5 px-4 font-mono text-blue-500/50 text-sm'>
                      #00{user.id}
                    </td>
                    <td className='py-5 px-4 font-bold text-white group-hover:text-blue-400 transition-colors'>
                      {user.username}
                    </td>
                    <td className='py-5 px-4'>
                      <span
                        className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-tighter ${
                          user.role === "admin"
                            ? "bg-red-500/20 text-red-400 border border-red-500/20"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className='py-5 px-4 text-right'>
                      <Link
                        href={`/user/${user.id}`}
                        className='inline-flex items-center gap-2 bg-white/5 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg hover:shadow-blue-600/20 border border-white/10 hover:border-blue-500'
                      >
                        View Profile <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className='text-center py-20'>
              <div className='text-4xl mb-4 opacity-20'>📡</div>
              <p className='text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse'>
                Scanning database... No matches found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
