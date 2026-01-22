import { initDB } from '@/lib/db';
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '';
    const db = await initDB();

    // 1. ตรวจสอบระดับความปลอดภัยจาก Cookie (ถ้าไม่มีให้เป็น 'low' โดยอัตโนมัติ)
    const securityLevel = req.cookies.get('security_level')?.value || 'low';

    let query;
    let users;

    if (securityLevel === 'high') {
      // ✅ โหมดปลอดภัย (High): ใช้ Parameterized Query เพื่อป้องกัน SQL Injection
      // เครื่องหมาย ? จะถูกแทนที่ด้วยค่าใน array อย่างปลอดภัยโดยฐานข้อมูลเอง
      query = `SELECT id, username, role FROM users WHERE username LIKE ?`;
      users = await db.all(query, [`%${name}%`]);
    } else {
      // ❌ โหมดอันตราย (Low): ใช้การต่อ String แบบดั้งเดิมที่มีช่องโหว่
      query = `SELECT id, username, role FROM users WHERE username LIKE '%${name}%'`;
      users = await db.all(query);
    }
    
    console.log(`[Security: ${securityLevel.toUpperCase()}] Executing:`, query);

    // 2. ปรับการส่งข้อมูลกลับ: ส่งทั้งรายชื่อผู้ใช้ (users) และคำสั่ง SQL ที่รันจริง (executedQuery)
    // เพื่อให้หน้าบ้านนำไปแสดงผลในกล่องสีดำ (Live Viewer) ได้
    return NextResponse.json({ 
      users, 
      executedQuery: query 
    });

  } catch (error) {
    console.error("Database Error:", error.message);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}