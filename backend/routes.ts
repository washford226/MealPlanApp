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

router.post('/signup', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const db = (req as any).db;

  bcrypt.hash(password, 10)
    .then(hashedPassword => {
      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      return db.query(query, [username, email, hashedPassword]);
    })
    .then(() => {
      res.status(200).send('User signed up successfully');
    })
    .catch(err => {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    });
});

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = (req as any).db;

  interface QueryResult {
    rows: User[];
  }

  db.query('SELECT * FROM users WHERE username = ?', [username])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User does not exist');
      }

      const user: User = rows[0];
      return bcrypt.compare(password, user.password)
        .then((isPasswordValid: boolean) => {
          if (!isPasswordValid) {
            return res.status(400).send('Password incorrect');
          }

          const secret: string | undefined = process.env.JWT_SECRET;
          if (!secret) {
            return res.status(500).send('JWT secret is not defined');
          }

          const token: string = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
          res.status(200).json({ message: 'User logged in successfully', token });
        });
    })
    .catch((err: Error) => {
      console.error('Error logging in:', err);
      res.status(500).send('Error logging in');
    });
});

// Edit user information
router.put('/user/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const db = (req as any).db;

  const updateUser = (hashedPassword?: string) => {
    const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
    return db.query(query, [username, email, hashedPassword, id]);
  };

  interface UpdateUserRequest extends Request {
    body: {
      username: string;
      email: string;
      password?: string;
    };
    params: {
      id: string;
    };
    db: any;
  }

  (password ? bcrypt.hash(password, 10).then((hashedPassword: string) => updateUser(hashedPassword)) : updateUser())
    .then(() => {
    res.status(200).send('User updated successfully');
    })
    .catch((err: Error) => {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
    });
});

// Delete user
router.delete('/user/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = (req as any).db;

  const query = 'DELETE FROM users WHERE id = ?';
  interface DeleteUserRequest extends Request {
    params: {
      id: string;
    };
    db: any;
  }

  const deleteUserHandler = (req: DeleteUserRequest, res: Response) => {
    const { id } = req.params;
    const db = req.db;
  
    const query = 'DELETE FROM users WHERE id = ?';
  
    db.query(query, [id])
      .then(() => {
        res.status(200).send('User deleted successfully');
      })
      .catch((err: Error) => {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
      });
  };
  
  router.delete('/user/:id', (req: Request, res: Response) => {
    deleteUserHandler(req as DeleteUserRequest, res);
  });
});

export default router;