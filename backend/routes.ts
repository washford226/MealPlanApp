import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import authMiddleware from './authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  profile_picture: string | Blob;
}

router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Meal API');
});

router.post('/signup', upload.single('profile_picture'), (req: Request, res: Response) => {
  const { username, email, password, calories_goal, dietary_restrictions } = req.body;
  const profilePicture = req.file?.buffer;
  const db = (req as any).db;

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email])
    .then(async ([rows]: [User[], any]) => {
      if (rows.length > 0) {
        return res.status(400).send({ message: 'Username or email already exists' });
      }

      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword: string) => {
      const query = 'INSERT INTO users (username, email, password, calories_goal, dietary_restrictions, profile_picture) VALUES (?, ?, ?, ?, ?, ?)';
      return db.query(query, [username, email, hashedPassword, calories_goal, dietary_restrictions, profilePicture]);
    })
    .then(() => {
      res.status(200).send('User signed up successfully');
    })
    .catch((err: Error) => {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    });
});

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = (req as any).db;

  db.query('SELECT * FROM users WHERE username = ?', [username])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User does not exist');
      }

      const user = rows[0];
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
router.put('/user/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const db = (req as any).db;

  const updateUser = (hashedPassword?: string) => {
    const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
    return db.query(query, [username, email, hashedPassword, id]);
  };

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
router.delete('/userdelete', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = (req as any).db;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [user.id])
    .then(() => {
      res.status(200).send('User deleted successfully');
    })
    .catch((err: Error) => {
      console.error('Error deleting user:', err);
      res.status(500).send('Error deleting user');
    });
});

// Get user information
router.get('/user', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = (req as any).db;

  db.query('SELECT username, calories_goal, dietary_restrictions, profile_picture FROM users WHERE id = ?', [user.id])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }

      res.status(200).json(rows[0]);
    })
    .catch((err: Error) => {
      console.error('Error fetching user data:', err);
      res.status(500).send('Error fetching user data');
    });
});

// Change user password
router.put('/user/change-password', authMiddleware, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;
  const db = (req as any).db;

  db.query('SELECT password FROM users WHERE id = ?', [user.id])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }

      const userRecord = rows[0];
      return bcrypt.compare(currentPassword, userRecord.password)
        .then((isPasswordValid: boolean) => {
          if (!isPasswordValid) {
            return res.status(400).send('Current password is incorrect');
          }

          return bcrypt.hash(newPassword, 10)
            .then(hashedNewPassword => {
              return db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, user.id])
                .then(() => {
                  res.status(200).send('Password changed successfully');
                });
            });
        });
    })
    .catch((err: Error) => {
      console.error('Error changing password:', err);
      res.status(500).send('Error changing password');
    });
});

router.post('/upload-profile-picture', authMiddleware, upload.single('profile_picture'), (req: Request, res: Response): void => {
  const user = (req as any).user;
  const db = (req as any).db;
  const profilePicture = req.file?.buffer;

  if (!profilePicture) {
    res.status(400).send('No file uploaded');
    return;
  }

  const query = 'UPDATE users SET profile_picture = ? WHERE id = ?';
  db.query(query, [profilePicture, user.id])
    .then(() => {
      res.status(200).send('Profile picture uploaded successfully');
    })
    .catch((err: Error) => {
      console.error('Error uploading profile picture:', err);
      res.status(500).send('Error uploading profile picture');
    });
});

router.put('/user/calories-goal', authMiddleware, (req: Request, res: Response) => {
  const { calories_goal } = req.body;
  const user = (req as any).user;
  const db = (req as any).db;

  const query = 'UPDATE users SET calories_goal = ? WHERE id = ?';
  db.query(query, [calories_goal, user.id])
    .then(() => {
      res.status(200).send('Calories goal updated successfully');
    })
    .catch((err: Error) => {
      console.error('Error updating calories goal:', err);
      res.status(500).send('Error updating calories goal');
    });
});

router.put('/user/dietary-restrictions', authMiddleware, (req: Request, res: Response) => {
  const { dietary_restrictions } = req.body;
  const user = (req as any).user;
  const db = (req as any).db;

  const query = 'UPDATE users SET dietary_restrictions = ? WHERE id = ?';
  db.query(query, [dietary_restrictions, user.id])
    .then(() => {
      res.status(200).send('Dietary restrictions updated successfully');
    })
    .catch((err: Error) => {
      console.error('Error updating dietary restrictions:', err);
      res.status(500).send('Error updating dietary restrictions');
    });
});

router.get('/user/get-picture', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = (req as any).db;

  db.query('SELECT username, calories_goal, dietary_restrictions, profile_picture FROM users WHERE id = ?', [user.id])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }

      const userData = rows[0];
      if (userData.profile_picture) {
        if (typeof userData.profile_picture === 'string') {
          userData.profile_picture = Buffer.from(userData.profile_picture).toString('base64');
        }
      }

      res.status(200).json(userData);
    })
    .catch((err: Error) => {
      console.error('Error fetching user data:', err);
      res.status(500).send('Error fetching user data');
    });
});

export default router;