import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  // ล้างคุกกี้ทั้งหมดที่เกี่ยวข้อง
  response.cookies.set("isLoggedIn", "", { maxAge: 0, path: "/" });
  response.cookies.set("is_auth", "", { maxAge: 0, path: "/" });
  response.cookies.set("security_level", "", { maxAge: 0, path: "/" });

  return response;
}
