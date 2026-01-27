import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = await initDB();

    const userRole = req.cookies.get("role")?.value;
    const loggedInUser = req.cookies.get("username")?.value;
    const securityLevel = req.cookies.get("security_level")?.value || "low";

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 🛡️ Logic ป้องกัน IDOR ในโหมด HIGH
    if (securityLevel === "high") {
      // 🛡️ ป้องกัน IDOR: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของโปรไฟล์ -> บล็อก
      if (userRole !== "administrator" && loggedInUser !== user.username) {
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
