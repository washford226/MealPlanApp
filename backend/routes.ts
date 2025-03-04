import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Meal API');
});

router.post('/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const db = (req as any).db;

  try {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await db.query(query, [username, email, password]);
    res.status(200).send('User signed up successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

export default router;