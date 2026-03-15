import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  let query = "";

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and Password are required!" },
        { status: 400 },
      );
    }

    // ✅ 1. ดึงโหมดความปลอดภัยจาก Cookie (สะพานเชื่อมหน้าบ้าน-หลังบ้าน)
    const securityLevel = req.cookies.get("security_level")?.value || "low";
    /** @type {import('sqlite3').Database} */
    const db = await initDB();
    let user;

    // ✅ 2. แยก Logic ตามระดับความปลอดภัย
    if (securityLevel === "low") {
      // 🔴 MODE: LOW (ต่อ String ตรงๆ - โดน SQL Injection ได้)
      query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      user = await db.get(query);
    } else {
      // 🟢 MODE: HIGH (ใช้ Prepared Statements - ป้องกัน SQL Injection 100%)
      // เราส่ง "โครงสร้าง" แยกกับ "ข้อมูล"
      query = `SELECT * FROM users WHERE username = ? AND password = ?`;
      user = await db.get(query, [username, password]);
    }

    console.log(
      "[Security Level:",
      securityLevel.toUpperCase(),
      "] Executing:",
      query,
    );
    if (user) {
      const response = NextResponse.json({
        message: "Login Success",
        user: { username: user.username, role: user.role },
        executedQuery: query,
      });

      // จัดการ Cookies สำหรับ Session (คงเดิมของคุณ)
      const cookieOptions = { path: "/", maxAge: 3600 };
      response.cookies.set("isLoggedIn", "true", {
        ...cookieOptions,
        httpOnly: true,
      });
      response.cookies.set("is_auth", "true", cookieOptions);
      response.cookies.set("role", user.role, cookieOptions);
      response.cookies.set("username", user.username, cookieOptions);

      return response;
    } else {
      return NextResponse.json(
        { message: "Invalid username or password", executedQuery: query },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Database Error:", error.message);
    return NextResponse.json(
      { error: error.message, executedQuery: query },
      { status: 500 },
    );
  }
}
