"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUser(data);
      });
  }, [id]);

  // --- 🔴 หน้าจอเมื่อโดนบล็อก (Error State) ---
  if (error)
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="max-w-md w-full backdrop-blur-md bg-red-500/5 border border-red-500/20 p-10 rounded-[2rem] text-center shadow-2xl shadow-red-500/10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tighter">Security Block</h1>
          <p className="text-slate-400 font-mono text-sm mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20 cursor-pointer"
          >
            ← Back to Safety
          </button>
        </div>
      </div>
    );

  // --- ⏳ หน้าจอโหลดข้อมูล ---
  if (!user)
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-mono animate-pulse">Decrypting Data...</p>
      </div>
    );

  // --- ✅ หน้าจอโปรไฟล์ (Success State) ---
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 p-6 flex items-center justify-center">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-blue-400 mb-8 flex items-center gap-2 font-bold transition-colors cursor-pointer group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-600/20">
            👤
          </div>
          <div>
            <h1 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">Internal Profile</h1>
            <p className="text-3xl font-black text-white tracking-tight leading-none">{user.username}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Access Level
              </label>
              <p className={`text-lg font-mono font-bold ${user.role === 'admin' ? 'text-red-400' : 'text-blue-400'}`}>
                {user.role?.toUpperCase()}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  System Status
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-300">Verified User</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-600">UID: 00{id}</span>
            </div>
          </div>
        </div>

        {/* Decor line */}
        <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
    </div>
  );
}