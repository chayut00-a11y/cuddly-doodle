"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter เพิ่มเข้ามา

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter(); // 2. ประกาศใช้งาน router

  useEffect(() => {
    // 💡 เช็คสถานะการล็อกอินจาก Cookie โดยตรงที่ฝั่ง Browser
    const checkAuth = () => {
      const isLoggedIn = document.cookie.includes("isLoggedIn=true");
      if (isLoggedIn) {
        // หากพบว่าล็อกอินอยู่แล้ว ให้เปลี่ยนหน้าไป /user ทันทีโดยไม่เก็บประวัติหน้า login
        window.location.replace("/user");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // ล้างข้อความเก่าก่อนเริ่มส่งใหม่

    // 🛡️ 1. เพิ่มการเช็คค่าว่าง (Frontend Required Check)
    // ตรงนี้จะป้องกันไม่ให้ User กด Login ได้ถ้าไม่พิมพ์อะไรเลย
    if (!username || !password) {
      setMessage("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน");
      return; // หยุดการทำงาน ไม่ส่งไปที่ Server
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ กรณีสำเร็จ (รวมถึงกรณีที่ใช้ SQL Injection เจาะผ่าน)
        window.location.replace("/user");
      } else {
        // ❌ กรณีรหัสผิด หรือ Server ตีกลับ (400, 401, 500)
        setMessage(data.message || data.error || "เกิดข้อผิดพลาดในการล็อกอิน");
      }
    } catch (err) {
      // 🛠️ แก้ปัญหา Warning 'err' is defined but never used เรียบร้อย
      console.error("Connection Error:", err);
      setMessage("ไม่สามารถเชื่อมต่อกับ Server ได้");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black'>
      <form
        onSubmit={handleLogin}
        className='p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100'
      >
        <h2 className='text-3xl font-black mb-8 text-center text-blue-900'>
          Security Lab
        </h2>

        {/* 🚨 แสดงข้อความแจ้งเตือนเมื่อมี Error */}
        {message && (
          <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm font-bold animate-pulse'>
            ⚠️ {message}
          </div>
        )}

        <div className='space-y-4'>
          <input
            type='text'
            placeholder='Username'
            required
            className='w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all'
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type='password'
            placeholder='Password'
            required
            className='w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all'
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg cursor-pointer'>
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
