"use client";
import { useState, useEffect } from "react";

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ค่าเริ่มต้นเป็นว่าง เพื่อให้ดึงทุกคน
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

      // 📝 Log บอกว่าระบบกำลังโหลดข้อมูลทั้งหมด (Initial Load)
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
      const res = await fetch(`/api/users?name=${searchTerm}`);
      const data = await res.json();

      if (res.ok) {
        const rawUsers = data.users || [];

        // ✅ เพิ่ม Logic ตรงนี้: กรองให้เหลือ 1 ID ต่อ 1 แถว
        // ข้อมูลตัวหลัง (Injected Data) จะไปทับข้อมูลตัวหน้า (Original Data)
        const uniqueUsers = Array.from(
          new Map(rawUsers.map((user) => [user.id, user])).values(),
        );

        setUsers(uniqueUsers); // ใช้ข้อมูลที่กรองแล้ว
        setExecutedQuery(data.executedQuery || "");
      }
    };

    fetchData();
  }, [searchTerm, securityLevel, isMounted]);

  const toggleSecurity = () => {
    const newLevel = securityLevel === "low" ? "high" : "low";

    // 🛡️ Log แสดงการสลับโหมดความปลอดภัย
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
    <div className='p-8 bg-gray-50 min-h-screen text-black font-sans'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-extrabold text-blue-900 tracking-tight'>
            Security Lab: User Directory
          </h1>
          <div className='flex gap-3'>
            <button
              onClick={toggleSecurity}
              className={`px-5 py-2 rounded-full font-bold transition-all active:scale-95 shadow-sm ${
                securityLevel === "low"
                  ? "bg-red-100 text-red-600 border-2 border-red-500 hover:bg-red-200"
                  : "bg-green-100 text-green-600 border-2 border-green-500 hover:bg-green-200"
              }`}
            >
              MODE: {securityLevel.toUpperCase()}
            </button>
            <button
              onClick={handleLogout}
              className='bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-black transition-colors shadow-md'
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🕵️ Live SQL Viewer */}
        <div className='bg-slate-900 rounded-xl p-6 mb-8 shadow-2xl border-l-8 border-blue-500'>
          <h3 className='text-blue-400 text-xs font-bold uppercase mb-3 tracking-widest'>
            Executed SQL Query (Backend)
          </h3>
          <code className='text-green-400 font-mono text-lg break-all'>
            {executedQuery || "Loading query..."}
          </code>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
          <input
            type='text'
            placeholder='ลองใช้ SQL Injection ในโหมด LOW...'
            className='w-full p-4 mb-8 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-lg shadow-inner'
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <table className='w-full text-left'>
            <thead>
              <tr className='border-b-2 border-gray-100 text-gray-400 uppercase text-xs font-black tracking-widest'>
                <th className='py-4 px-2'>ID</th>
                <th className='py-4 px-2'>Username</th>
                <th className='py-4 px-2 text-red-500'>
                  Role (Sensitive Data)
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(
                (
                  user,
                  index, // 👈 เพิ่ม index เข้ามา
                ) => (
                  <tr key={`${user.id}-${index}`} className='...'>
                    <td className='py-5 px-2'>{user.id}</td>
                    <td className='py-5 px-2 font-bold'>{user.username}</td>
                    <td className='py-5 px-2 text-blue-600 font-mono'>
                      {user.role}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
