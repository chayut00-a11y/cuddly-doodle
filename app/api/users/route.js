import { initDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
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

    const isAdmin = userRole === "administrator"; // เช็คจาก Role แทนชื่อแล้ว
    let query;
    let users;

    if (securityLevel === "high") {
      // ✅ โหมด HIGH: ใช้สิทธิ์ตาม Role (RBAC)
      if (isAdmin) {
        query = `SELECT id, username, role FROM users WHERE username LIKE ?`;
        users = await db.all(query, [`%${name}%`]);
      } else {
        query = `SELECT id, username, role FROM users WHERE username = ? AND username LIKE ?`;
        users = await db.all(query, [loggedInUser, `%${name}%`]);
      }
    } else {
      // ❌ โหมด LOW: มีช่องโหว่ SQL Injection
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

    return NextResponse.json({ users, executedQuery: query });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
