import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  // ประกาศตัวแปรไว้ข้างนอก try เพื่อให้ catch เรียกใช้ได้
  let query = "";

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";
    const db = await initDB();

    const userRole = req.cookies.get("role")?.value;
    const loggedInUser = req.cookies.get("username")?.value;
    const securityLevel = req.cookies.get("security_level")?.value || "low";

    if (!loggedInUser) {
      return NextResponse.json({
        users: [],
        executedQuery: "Please login first",
      });
    }

    const isAdmin = userRole === "administrator";
    let users;

    // --- ส่วนการสร้าง Query (เหมือนเดิมของคุณ) ---
    if (securityLevel === "high") {
      if (isAdmin) {
        query = `SELECT id, username, role FROM users WHERE username LIKE ?`;
        users = await db.all(query, [`%${name}%`]);
      } else {
        query = `SELECT id, username, role FROM users WHERE username = ? AND username LIKE ?`;
        users = await db.all(query, [loggedInUser, `%${name}%`]);
      }
    } else {
      if (isAdmin) {
        query = `SELECT id, username, role FROM users WHERE username LIKE '%${name}%'`;
      } else {
        const filter = name
          ? `username LIKE '%${name}%'`
          : `username = '${loggedInUser}'`;
        query = `SELECT id, username, role FROM users WHERE ${filter}`;
      }
      users = await db.all(query);
    }

    // กรณีสำเร็จ
    return NextResponse.json({ users, executedQuery: query });
  } catch (error) {
    // ✅ จุดสำคัญ: เมื่อ SQL พัง ให้ส่ง query ที่ "ต้นเหตุ" กลับไปด้วย
    console.error("SQL Error:", error.message);

    return NextResponse.json(
      {
        users: [],
        executedQuery: query, // ส่งคำสั่งที่พังกลับไปโชว์ที่หน้าบ้าน
        error: error.message,
      },
      { status: 500 },
    );
  }
}
