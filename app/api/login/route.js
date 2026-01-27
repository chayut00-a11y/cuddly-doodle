import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and Password are required!" },
        { status: 400 },
      );
    }

    const db = await initDB();

    // 🔍 1. อ่านค่า Security Level จาก Cookie (ถ้าไม่มีให้เป็น low)
    const securityLevel = req.cookies.get("security_level")?.value || "low";

    let query = "";
    let user = null;

    // 🛡️ 2. เลือกใช้ SQL ตามระดับความปลอดภัย
    if (securityLevel === "high") {
      // ✅ โหมดปลอดภัย: ใช้ Prepared Statements (?)
      query = "SELECT * FROM users WHERE username = ? AND password = ?";
      user = await db.get(query, [username, password]);
    } else {
      // ⚠️ โหมดเปราะบาง: ใช้ String Interpolation (แบบเดิมที่คุณเขียนไว้)
      query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      user = await db.get(query);
    }

    console.log(`[Mode: ${securityLevel.toUpperCase()}] Executing:`, query);

    if (user) {
      // ✅ Login สำเร็จ: สร้าง Response และคืนค่าข้อมูลพร้อม Query ที่ใช้
      const response = NextResponse.json({
        message: "Login Success",
        user: { username: user.username, role: user.role },
        executedQuery: query, // ส่งไปแสดงผลใน Lab
        mode: securityLevel,
      });

      // 🌟 ตั้งค่าคุกกี้ครบทั้ง 4 ตัวตามโค้ดเดิมของคุณ
      response.cookies.set("isLoggedIn", "true", {
        path: "/",
        httpOnly: true,
        maxAge: 3600,
      });

      response.cookies.set("is_auth", "true", {
        path: "/",
        httpOnly: false,
        maxAge: 3600,
      });

      response.cookies.set("role", user.role, {
        path: "/",
        httpOnly: false,
        maxAge: 3600,
      });

      response.cookies.set("username", user.username, {
        path: "/",
        httpOnly: false,
        maxAge: 3600,
      });

      return response;
    } else {
      // ❌ Login ไม่สำเร็จ
      return NextResponse.json(
        {
          message: "Invalid username or password",
          executedQuery: query,
          mode: securityLevel,
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Database Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
