import { NextResponse } from 'next/server';

export async function POST() {
  // สร้าง Response แจ้งว่า Logout สำเร็จ
  const response = NextResponse.json({ message: "Logout successful" });

  // สั่งให้ Browser ลบ Cookie ชื่อ 'isLoggedIn' โดยการตั้งค่าให้หมดอายุทันที (maxAge: 0)
  response.cookies.set('isLoggedIn', '', { 
    path: '/', 
    maxAge: 0 
  });

  return response;
}