import { initDB } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '';
    const db = await initDB();

    // ⚠️ ช่องโหว่: ใช้ LIKE ร่วมกับการต่อ String ทำให้ทำ UNION-Based Injection ได้ง่าย
    const query = `SELECT id, username, role FROM users WHERE username LIKE '%${name}%'`;
    
    console.log("Executing Search Query:", query);

    const users = await db.all(query);
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}