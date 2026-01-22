import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // ✅ จุดที่ต้องแก้: ต้องเติม await หน้า params ครับ
    const { id } = await params;

    const db = await initDB();
    const securityLevel = req.cookies.get("security_level")?.value || "low";

    // ดึงข้อมูลผู้ใช้ตาม ID
    const user = await db.get(
      "SELECT id, username, role FROM users WHERE id = ?",
      [id],
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🛡️ Logic ป้องกัน IDOR ในโหมด HIGH
    if (securityLevel === "high") {
      const loggedInUser = req.cookies.get("username")?.value;
      if (loggedInUser !== user.username && loggedInUser !== "admin") {
        return NextResponse.json(
          { error: "Access Denied: IDOR Protection Active" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
