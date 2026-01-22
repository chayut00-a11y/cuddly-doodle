import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. รับข้อมูลจากหน้าบ้าน (Frontend)
    const { username, password } = await req.json();

    // 2. เชื่อมต่อฐานข้อมูล
    const db = await initDB();

    // 3. สร้าง Query แบบเปราะบาง (Vulnerable Query)
    // ⚠️ มีช่องโหว่ SQL Injection เพราะใช้การต่อ String โดยตรง
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    // พิมพ์ Query ออกมาดูใน Terminal/Console Ninja เพื่อวิเคราะห์การโจมตี
    console.log("Executing Query:", query);

    // 4. ค้นหาข้อมูลใน Database
    const user = await db.get(query);

    if (user) {
      // ✅ กรณี Login สำเร็จ: สร้าง Response พร้อมแนบ Cookie
      const response = NextResponse.json({
        message: "Login Success",
        user: { username: user.username, role: user.role },
      });

      // 1. คุกกี้หลักสำหรับ Middleware (มองไม่เห็นจาก JavaScript)
      response.cookies.set("isLoggedIn", "true", {
        path: "/",
        httpOnly: true,
        maxAge: 3600,
      });

      // 2. คุกกี้เสริมสำหรับ Client-side Check (JavaScript มองเห็นได้)
      response.cookies.set("is_auth", "true", {
        path: "/",
        httpOnly: false, // ✅ ต้องเป็น false เพื่อให้ useEffect ในหน้า Login อ่านได้
        maxAge: 3600,
      });

      return response;
    } else {
      // ❌ กรณี Login ไม่สำเร็จ
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }
  } catch (error) {
    // 🛠️ กรณีเกิด Error ในระดับ SQL (เช่น Payload ที่ใช้ทำให้ Syntax พัง)
    // การคืนค่า Error 500 พร้อม message จะช่วยให้เราศึกษาพฤติกรรมของฐานข้อมูลได้
    console.error("Database Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
