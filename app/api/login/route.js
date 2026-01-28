import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  // ✅ 1. ประกาศตัวแปร query ไว้ข้างนอกเพื่อให้บล็อก catch เข้าถึงได้
  let query = "";

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and Password are required!" },
        { status: 400 },
      );
    }

    const db = await initDB();

    // ✅ 2. สร้างคำสั่ง SQL (แบบเปราะบางเพื่อการเรียนรู้)
    query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log("Executing Query:", query);

    const user = await db.get(query);

    if (user) {
      // ✅ กรณี Login สำเร็จ: แนบ executedQuery กลับไปด้วย
      const response = NextResponse.json({
        message: "Login Success",
        user: { username: user.username, role: user.role },
        executedQuery: query, // 👈 ส่งไปโชว์ในกล่องดำ
      });

      // จัดการ Cookies (ตาม Logic เดิมของคุณ)
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
      // ❌ กรณี Login ไม่สำเร็จ (Invalid Credentials): ก็ยังส่ง executedQuery กลับไป
      return NextResponse.json(
        {
          message: "Invalid username or password",
          executedQuery: query, // 👈 เพื่อให้ Hacker เห็นว่า Payload ตัวเองถูกแปลงเป็นแบบไหน
        },
        { status: 401 },
      );
    }
  } catch (error) {
    // 🛠️ กรณี SQL พัง (Error 500): เช่น ใส่โควตาไม่ครบจน Syntax ผิด
    console.error("Database Error:", error.message);
    return NextResponse.json(
      {
        error: error.message,
        executedQuery: query, // 👈 สำคัญมาก! เพื่อให้หน้าบ้านเห็น Query ตัวที่ทำให้พัง
      },
      { status: 500 },
    );
  }
}
