import { Request, Response } from 'express';
import { User } from '../models/user';
import * as bcrypt from 'bcrypt';
import * as mysql from 'mysql2/promise';

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Add a new user
export const addUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: "All fields are required." });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const [result] = await db.execute(query, [username, email, hashedPassword]);

    res.status(201).json({ success: true, message: "User added successfully", userId: (result as any).insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ success: false, message: "Username or email already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Database error", details: err.message });
  }
};

// Edit an existing user
export const editUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: "All fields are required." });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
    const [result] = await db.execute(query, [username, email, hashedPassword, id]);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Database error", details: err.message });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await db.execute(query, [id]);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Database error", details: err.message });
  }
};