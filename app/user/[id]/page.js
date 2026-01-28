"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ ลบ useRouter ออก
import Link from "next/link";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [executedQuery, setExecutedQuery] = useState(""); // ✅ เพิ่มเพื่อความสม่ำเสมอของ Lab
  const [isMounted, setIsMounted] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setTimestamp(new Date().toLocaleTimeString());

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        // ✅ ดึง SQL Query มาโชว์เหมือนหน้าอื่นๆ
        if (data.executedQuery) setExecutedQuery(data.executedQuery);

        if (data.error) setError(data.error);
        else setUser(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Connection Failed");
      }
    };

    fetchProfile();
  }, [id]);

  if (!isMounted) return null;

  // 🚨 UI เมื่อถูก Block (IDOR Attack Detected)
  if (error)
    return (
      <div className='min-h-screen bg-[#0a0f1e] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[120px]'></div>
        <div className='backdrop-blur-2xl bg-black/40 border-2 border-red-500/30 rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] relative'>
          <div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto border border-red-500/50 animate-pulse'>
            ⚠️
          </div>
          <h2 className='text-3xl font-black text-red-500 tracking-tighter uppercase mb-4'>
            Access Revoked
          </h2>
          <p className='text-sm font-mono text-red-400/70 mb-8 leading-relaxed uppercase tracking-widest'>
            Security Violation: {error}
          </p>
          <Link
            href='/user'
            className='w-full flex items-center justify-center py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-red-600/20'
          >
            ← Return to Gateway
          </Link>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className='min-h-screen bg-[#0a0f1e] flex items-center justify-center font-mono text-blue-500 uppercase tracking-widest animate-pulse'>
        Decrypting Subject Data...
      </div>
    );

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-slate-200 p-6 md:p-12 relative overflow-hidden font-sans'>
      {/* 🌌 Background Glows */}
      <div className='fixed top-0 left-0 w-full h-full -z-10'>
        <div className='absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[100px]'></div>
        <div className='absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[100px]'></div>
      </div>

      <div className='max-w-2xl mx-auto space-y-8'>
        <Link
          href='/user'
          className='group text-slate-500 hover:text-white flex items-center gap-3 font-bold transition-all uppercase text-[10px] tracking-[0.3em]'
        >
          <span className='group-hover:-translate-x-1 transition-transform inline-block'>
            ←
          </span>{" "}
          Return to Terminal
        </Link>

        {/* 📟 Subject Dossier Card */}
        <div className='backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative'>
          <div className='mb-12 border-l-4 border-blue-600 pl-6'>
            <h1 className='text-4xl font-black text-white tracking-tighter uppercase leading-none'>
              Subject Profile
            </h1>
            <p className='text-xs font-mono text-blue-500 uppercase tracking-[0.4em] mt-3'>
              ID: {id}
            </p>
          </div>

          <div className='grid gap-10'>
            <div className='group'>
              <label className='text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-3'>
                Identity Identifier
              </label>
              <div className='bg-black/20 border border-white/5 rounded-2xl p-5 group-hover:border-blue-500/30 transition-colors'>
                <p className='text-2xl font-black text-white tracking-tight'>
                  {user.username}
                </p>
              </div>
            </div>

            <div className='bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[2rem] p-8 shadow-inner relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-scan'></div>
              <label className='text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-6'>
                🔒 Security Metadata
              </label>
              <div className='space-y-6 font-mono text-sm'>
                <div className='flex justify-between items-center border-b border-white/5 pb-4'>
                  <span className='text-slate-500 uppercase'>
                    Assigned Role
                  </span>
                  <span className='text-blue-400 font-bold uppercase'>
                    {user.role}
                  </span>
                </div>
                <div className='flex justify-between items-center border-b border-white/5 pb-4'>
                  <span className='text-slate-500 uppercase'>
                    Validation Status
                  </span>
                  <span className='text-green-500 font-bold uppercase'>
                    Verified User
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 🕵️ SQL Console Log (เพิ่มเพื่อให้สอดคล้องกับหน้าอื่นๆ) */}
          {executedQuery && (
            <div className='mt-10 p-6 bg-black/40 border border-white/10 rounded-2xl font-mono text-xs'>
              <p className='text-blue-400 uppercase tracking-widest mb-3 opacity-50'>
                Executed Access Query:
              </p>
              <code className='text-green-400 break-all'>
                ❯ {executedQuery}
              </code>
            </div>
          )}

          <div className='mt-12 pt-8 border-t border-white/5 flex justify-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em] text-center'>
            System timestamp: {timestamp} <br /> Access Node: 127.0.0.1 //
            encrypted
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
