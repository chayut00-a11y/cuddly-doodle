import { NextResponse } from "next/server";

export function middleware(request) {
  // ✅ 1. ต้องดึง .value ออกมาเช็ค และตรวจสอบว่าเป็น "true" จริงหรือไม่
  const loginCookie = request.cookies.get("isLoggedIn")?.value === "true";
  const { pathname } = request.nextUrl;

  // 🚩 [DEBUG] ปลดคอมเมนต์บรรทัดข้างล่างเพื่อเช็คใน Terminal ว่าค่าออกมาเป็นอะไร
  // console.log(`Path: ${pathname}, IsLoggedIn: ${loginCookie}`);

  // 2. ถ้าล็อกอินแล้ว แต่จะเข้าหน้า Login หรือหน้าแรก
  if ((pathname === "/login" || pathname === "/") && loginCookie) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // 3. ถ้ายังไม่ล็อกอิน แต่จะเข้าหน้าสำหรับสมาชิก
  if (pathname.startsWith("/user") && !loginCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. จัดการเรื่อง Header สำหรับหน้า Login (เพื่อแก้ปัญหาปุ่ม Back)
  const response = NextResponse.next();

  if (pathname === "/login" || pathname === "/") {
    // สั่งให้ Browser ทำลายทิ้งทันทีที่เลิกดู ห้ามเก็บเข้า Cache
    response.headers.set(
      "Cache-Control",
      "no-store, max-age=0, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  // ✅ ปรับ matcher ให้เจาะจงมากขึ้น เพื่อไม่ให้ไปยุ่งกับไฟล์รูปภาพหรือไฟล์ระบบ
  matcher: ["/", "/login", "/user/:path*"],
};
