// lib/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function initDB() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, 
      username TEXT,
      password TEXT,
      role TEXT
    );
  `);

  const users = await db.all("SELECT * FROM users");
  if (users.length === 0) {
    await db.run(
      "INSERT INTO users (id, username, password, role) VALUES (1, 'admin', 'admin123', 'administrator')",
    );
    await db.run(
      "INSERT INTO users (id, username, password, role) VALUES (2, 'user1', 'password123', 'user')",
    );
    await db.run(
      "INSERT INTO users (id, username, password, role) VALUES (3, 'user2', 'password123', 'user')",
    );
  }

  return db;
}
