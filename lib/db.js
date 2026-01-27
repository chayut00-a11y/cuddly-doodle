import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export async function initDB() {
  // 💡 หัวใจสำคัญ: ใช้ process.cwd() เพื่ออ้างอิงถึง Root ของโปรเจกต์เสมอ
  // วิธีนี้จะทำให้ Vercel หาไฟล์ database.sqlite เจอ ไม่ว่าจะรันใน Serverless Function ตัวไหน
  const dbPath = path.join(process.cwd(), "database.sqlite");

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // 1. สร้างตารางถ้ายังไม่มี (Idempotent)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      username TEXT,
      password TEXT,
      role TEXT
    );
  `);

  // 2. เช็คว่ามีข้อมูลหรือยัง?
  const users = await db.all("SELECT * FROM users");

  if (users.length === 0) {
    // 🌟 ระบบ Auto-Seed: สำคัญมากสำหรับ Vercel เพราะฐานข้อมูลอาจถูก Reset ได้บ่อยๆ
    // การใส่ข้อมูลไว้ตรงนี้ช่วยให้ Lab ของเรา "สดใหม่" และใช้งานได้ตลอดเวลาครับ
    console.log("🌱 Seeding database with initial users...");
    await db.run(
      "INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'administrator')",
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES ('user1', 'password123', 'user')",
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES ('user2', 'password123', 'user')",
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES ('user3', 'secret456', 'user')",
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES ('guest', 'guest', 'user')",
    );
  }

  return db;
}
