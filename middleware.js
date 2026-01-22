import { NextResponse } from "next/server";

export function middleware(request) {
  // 1. ดึงค่า Cookie ที่ชื่อ 'isLoggedIn' ออกมาตรวจสอบสถานะการ Login
  const loginCookie = request.cookies.get("isLoggedIn");

  // 2. ตรวจสอบ Path หรือ URL ปัจจุบันที่ผู้ใช้กำลังเข้าถึง
  const { pathname } = request.nextUrl;

  /**
   * กรณีที่ 1: การป้องกันหน้าสำหรับการใช้งานหลัก (Route Protection)
   * ถ้าผู้ใช้พยายามเข้าหน้า /user (หรือหน้าย่อย) แต่ตรวจไม่พบ Cookie การ Login
   */
  if (pathname.startsWith("/user") && !loginCookie) {
    // ให้ดีดกลับไปที่หน้า /login ทันที เพื่อให้ทำการยืนยันตัวตนก่อน
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /**
   * กรณีที่ 2: การป้องกันการเข้าหน้า Login ซ้ำ (Double Login Prevention)
   * ถ้าผู้ใช้มี Cookie อยู่แล้ว (Login แล้ว) แต่พยายามพิมพ์ URL กลับไปที่หน้า /login
   * (รวมถึงกรณีที่กดปุ่ม Back กลับมาด้วย)
   */
  if (pathname === "/login" && loginCookie) {
    // ให้ Redirect ไปที่หน้า /user ทันที เพราะผู้ใช้มีสิทธิ์ใช้งานอยู่แล้ว
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // 3. หากไม่ติดเงื่อนไขใดๆ ให้ปล่อยผ่านไปยังหน้าที่ต้องการตามปกติ
  return NextResponse.next();
}

/**
 * กำหนดขอบเขตการทำงานของ Middleware
 */
export const config = {
  // สำคัญมาก: ต้องเพิ่ม '/login' เข้าไปใน matcher เพื่อให้ Middleware ทำงานที่หน้า Login ด้วย
  matcher: ["/user/:path*", "/login"],
};
