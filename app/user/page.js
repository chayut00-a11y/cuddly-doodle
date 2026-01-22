"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // สำหรับเปลี่ยนหน้า

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ 1. นิยามฟังก์ชันไว้ในระดับบนของ Component เพื่อให้ทุกส่วนเรียกใช้ได้
  const fetchUsers = async (query = "") => {
    try {
      const res = await fetch(`/api/users?name=${query}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // ✅ 2. ใช้ useEffect เรียกใช้ฟังก์ชันด้านบนตอนโหลดหน้าครั้งแรก
  useEffect(() => {
    const init = async () => {
      await fetchUsers(); // จะหาฟังก์ชันเจอเพราะนิยามไว้ด้านบนแล้ว
    };
    init();
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) router.push("/login");
  };

  // แยกฟังก์ชันสำหรับการกดปุ่ม Search (อันนี้เรียกใช้จากปุ่มโดยตรง ไม่ผ่าน useEffect)
  const handleSearch = async () => {
    const res = await fetch(`/api/users?name=${search}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  return (
    <div className='p-10 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-slate-800'>User Directory</h1>

        <button
          onClick={handleLogout}
          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors shadow-sm'
        >
          Log out
        </button>
      </div>

      <div className='mb-8 flex gap-2'>
        <input
          type='text'
          placeholder='Search by name...'
          className='p-2 border rounded w-full max-w-md placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-black'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors'
        >
          Search
        </button>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {users.map((user, idx) => (
          <div
            key={idx}
            className='p-4 bg-white shadow-sm border border-gray-200 rounded-lg flex justify-between items-center'
          >
            <div>
              <p className='font-bold text-lg text-slate-700'>
                {user.username}
              </p>
              <p className='text-sm text-slate-500 italic'>Role: {user.role}</p>
            </div>
            {/* แสดงข้อมูลที่อาจถูก Inject ออกมา (เช่น Password) */}
            {user.password && (
              <div className='text-red-600 font-mono bg-red-50 p-2 rounded border border-red-100 text-sm'>
                Injected Data: {user.password}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
