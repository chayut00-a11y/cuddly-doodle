import sqlite3 from "sqlite3";
import { open } from "sqlite";

// ฟังก์ชันสำหรับเชื่อมต่อและเริ่มต้น Database
export async function initDB() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // สร้างตาราง users ถ้ายังไม่มี
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      role TEXT
    );
  `);

  // ตรวจสอบว่ามีข้อมูล Admin หรือยัง ถ้าไม่มีให้เพิ่มเข้าไปเป็นข้อมูลตั้งต้นสำหรับ Lab
  const user = await db.get("SELECT * FROM users WHERE username = ?", [
    "admin",
  ]);
  if (!user) {
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["admin", "p@ssword123", "administrator"],
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["user1", "123456", "guest"],
    );

    // 💡 เพิ่มข้อมูลตัวอย่างเข้าไปอีกสัก 3-4 รายการครับ
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["bob", "bob789", "editor"],
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["alice", "alice999", "manager"],
    );
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      ["it_support", "it_hard_pass", "support"],
    );

    console.log("Database seeded with more users.");
  }

  return db;
}
