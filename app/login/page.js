"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [level, setLevel] = useState(() => {
    // ตรวจสอบว่ารันบน Browser หรือไม่ (ป้องกัน Error ใน Next.js SSR)
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
    setExecutedQuery(""); // ล้างค่า Query เก่าเวลาสลับโหมด
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
      setExecutedQuery(data.executedQuery); // 🌟 รับ Query จาก Backend มาโชว์

      if (res.ok) {
        // ถ้า Login สำเร็จ ให้รอแป๊บนึงก่อนไปหน้าถัดไปเพื่อให้ User เห็น Query
        setTimeout(() => router.push("/user"), 1000);
      } else {
        setMessage(data.message || "Login Failed");
      }
    } catch (error) {
      console.log(error)
      setMessage("An error occurred. Check console.");
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8'>
        {/* ส่วนหัวและปุ่ม Toggle */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Security Login Lab
          </h1>
          <button
            onClick={toggleSecurity}
            className={`px-4 py-1 rounded-full text-xs font-black transition-all ${
              level === "low"
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            MODE: {level.toUpperCase()}
          </button>
        </div>

        <form onSubmit={handleLogin} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Username
            </label>
            <input
              type='text'
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              type='password'
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none'
          >
            Sign in
          </button>
        </form>

        {message && (
          <div className='mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center'>
            {message}
          </div>
        )}
      </div>

      {/* 🖥️ กล่องแสดงผล SQL (หัวใจของ Lab นี้) */}
      {executedQuery && (
        <div className='w-full max-w-md mt-6 p-4 bg-gray-900 rounded-lg border-t-4 border-blue-500 shadow-xl'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-blue-400 text-xs font-bold uppercase tracking-widest'>
              Backend Execution Log
            </span>
            <span className='text-gray-500 text-[10px] font-mono'>SQLITE3</span>
          </div>
          <div className='bg-black p-3 rounded border border-gray-800 font-mono text-sm text-green-400 break-all'>
            <span className='text-gray-600'>$ </span>
            {executedQuery}
          </div>
        </div>
      )}
    </div>
  );
}
