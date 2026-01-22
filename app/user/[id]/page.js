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

  if (error)
    return (
      <div className='p-8 text-center'>
        <p className='text-red-500 font-bold text-xl mb-4'>
          🛡️ Security Block: {error}
        </p>
        <button
          onClick={() => router.push("/")}
          className='bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-sm cursor-pointer' // ✅ เพิ่ม cursor-pointer ตรงนี้
        >
          ← Back
        </button>
      </div>
    );

  if (!user)
    return (
      <div className='p-8 text-center text-gray-500'>กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      <div className='max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100'>
        <button
          onClick={() => router.back()}
          className='text-gray-400 hover:text-blue-600 mb-6 flex items-center gap-2 font-bold cursor-pointer'
        >
          ← Back
        </button>

        <h1 className='text-3xl font-black text-slate-800 mb-6'>
          User Profile
        </h1>

        <div className='space-y-6'>
          <div>
            <label className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
              Username
            </label>
            <p className='text-xl font-bold text-slate-700'>{user.username}</p>
          </div>

          <div className='p-6 bg-slate-50 rounded-2xl border border-slate-200'>
            <label className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
              🔒 ข้อมูลส่วนตัว (Private Data)
            </label>
            <p className='text-lg font-mono text-slate-600 mt-2'>
              Role: {user.role}
              <br />
              Status:{" "}
              <span className='font-bold text-blue-600'>
                Verified User
              </span>{" "}
              {/* ลบเส้นหยักออกแล้ว */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
