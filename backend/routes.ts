import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
}

router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Meal API');
});

router.post('/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const db = (req as any).db;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await db.query(query, [username, email, hashedPassword]);
    res.status(200).send('User signed up successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = (req as any).db;

  try {
    const [rows]: [User[], any] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).send('User does not exist');
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Password incorrect');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).send('JWT secret is not defined');
    }
    const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
    res.status(200).json({ message: 'User logged in successfully', token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Error logging in');
  }
});

// Edit user information
router.put('/user/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const db = (req as any).db;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
    await db.query(query, [username, email, hashedPassword, id]);
    res.status(200).send('User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
});

// Delete user
router.delete('/user/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = (req as any).db;

  try {
    const query = 'DELETE FROM users WHERE id = ?';
    await db.query(query, [id]);
    res.status(200).send('User deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});

export default router;