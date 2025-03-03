import { Request, Response } from 'express';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
import { User } from '../models/user';

dotenv.config();

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

// Dummy Data
let users: User[] = [
  {
    id: uuidv4(),
    username: 'will doe',
    email: 'will@example.com',
    password: 'password123'
  },
  {
    id: uuidv4(),
    username: 'wyatt doe',
    email: 'wyatt@example.com',
    password: 'password456'
  },
];

// Add New User
export const addUser = (req: Request, res: Response): void => {
  const { username, email, password } = req.body;

  const newUser: User = {
    id: uuidv4(), // Generate a new UUID for the id
    username,
    email,
    password
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// Save Users to Database
export const saveUsersToDatabase = async (req?: Request, res?: Response): Promise<void> => {
  try {
    const query = 'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email), password = VALUES(password)';
    for (const user of users) {
      await db.execute(query, [user.id, user.username, user.email, user.password]);
    }

    if (res) {
      res.status(200).json({ message: 'Users saved to database successfully' });
    } else {
      console.log('Users saved to database successfully');
    }
  } catch (err: any) {
    if (res) {
      res.status(500).json({ message: err.message });
    } else {
      console.error('Error saving users to database:', err.message);
    }
  }
};

// Edit a User
export const editUser = (req: Request, res: Response): void => {
  const userId = req.params.id;
  const { username, email, password } = req.body;

  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const updatedUser: User = { id: userId, username, email, password };
  users[userIndex] = updatedUser;

  res.json(updatedUser);
};

// Delete a User
export const deleteUser = (req: Request, res: Response): void => {
  const userId = req.params.id;
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  users = users.filter(user => user.id !== userId);
  res.status(204).send();
};