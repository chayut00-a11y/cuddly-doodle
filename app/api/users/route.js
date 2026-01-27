import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  // ✅ 1. ประกาศตัวแปร query ไว้ข้างนอกเพื่อให้บล็อก catch เข้าถึงได้เสมอ
  let query = "";

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";
    const db = await initDB();

    const userRole = req.cookies.get("role")?.value;
    const loggedInUser = req.cookies.get("username")?.value;
    const securityLevel = req.cookies.get("security_level")?.value || "low";

    // 🛡️ ตรวจสอบการ Login
    if (!loggedInUser) {
      return NextResponse.json({
        users: [],
        executedQuery: "Unauthorized: Please login first",
      });
    }

    const isAdmin = userRole === "administrator";
    let users;

    if (securityLevel === "high") {
      // ✅ โหมด HIGH: ปลอดภัยด้วย Prepared Statements (?)
      if (isAdmin) {
        query = `SELECT id, username, role FROM users WHERE username LIKE ?`;
        users = await db.all(query, [`%${name}%`]);
      } else {
        query = `SELECT id, username, role FROM users WHERE username = ? AND username LIKE ?`;
        users = await db.all(query, [loggedInUser, `%${name}%`]);
      }
    } else {
      // ❌ โหมด LOW: จงใจให้มีช่องโหว่ SQL Injection (String Concatenation)
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

    // ส่งผลลัพธ์ปกติกลับไป
    return NextResponse.json({ users, executedQuery: query });
  } catch (error) {
    // ✅ 2. จุดสำคัญที่สุด: แม้ SQL จะพัง เรายังส่ง 'query' ล่าสุดกลับไปโชว์ในหน้า UI
    // เพื่อให้กล่องสีเขียวอัปเดตตามนิ้วที่คนเล่นพิมพ์แบบ Real-time
    return NextResponse.json(
      {
        users: [],
        executedQuery: query,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
