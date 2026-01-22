"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter เพิ่มเข้ามา

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter(); // 2. ประกาศใช้งาน router

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ 3. ถ้า Login สำเร็จ (Status 200) ให้เปลี่ยนหน้าไปที่ /user ทันที
      router.push("/user");
    } else {
      // ❌ ถ้า Login พลาด ให้แสดงข้อความ Error เดิม
      setMessage(data.message || data.error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <form
        onSubmit={handleLogin}
        className='p-8 bg-white shadow-md rounded-lg w-96'
      >
        <h2 className='text-2xl text-black font-bold mb-6 text-center'>
          Security Lab Login
        </h2>
        <input
          type='text'
          placeholder='Username'
          className='w-full p-2 mb-4 border rounded placeholder-gray-400 text-black'
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          className='w-full p-2 mb-4 border rounded placeholder-gray-400 text-black'
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600'>
          Login
        </button>
        {message && (
          <p className='mt-4 text-center text-red-500 font-semibold'>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
