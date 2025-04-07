import { Router, Request, Response } from 'express';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; username: string };
    }
  }
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
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

// Signup user
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

// Login user
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

// Forgot Password or username
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const db = (req as any).db;

  (async () => {
    try {
      const [rows]: [User[], any] = await db.query('SELECT username, password FROM users WHERE email = ?', [email]);

      if (rows.length === 0) {
        return res.status(404).send('No user found with this email');
      }

      const user = rows[0];

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Account Information',
        text: `Hello ${user.username},\n\nHere is your account information:\n\nUsername: ${user.username}\nPassword: ${user.password}\n\nIf you did not request this email, please ignore it.\n\nThank you!`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).send('An email with your account information has been sent');
    } catch (err) {
      console.error('Error sending forgot password email:', err);
      res.status(500).send('Error sending email');
    }
  })();
});

// Update user information
router.put('/user/:username', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  const { email, password, calories_goal, dietary_restrictions } = req.body;
  const user = (req as any).user;
  const db = (req as any).db;

  if (username !== user.username) {
    res.status(403).send('You are not authorized to update this user');
    return;
  }

  const fields = { email, password, calories_goal, dietary_restrictions };
  const { query, values } = buildUpdateQuery(fields);

  if (!query) {
    res.status(400).send('No fields provided to update');
    return;
  }

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const passwordIndex = Object.keys(fields).indexOf('password');
      if (passwordIndex !== -1) {
        values[passwordIndex] = hashedPassword;
      }
    }

    const sql = `UPDATE users SET ${query} WHERE username = ?`;
    values.push(username);

    await db.query(sql, values);
    res.status(200).send('User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
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

  db.query('SELECT id, username, calories_goal, dietary_restrictions, profile_picture FROM users WHERE id = ?', [user.id])
    .then(([rows]: [User[], any]) => {
      if (rows.length === 0) {
        return res.status(404).send('User not found');
      }

      const userData = rows[0];

      // Convert the profile_picture BLOB to a Base64 string
      if (userData.profile_picture) {
        userData.profile_picture = `data:image/jpeg;base64,${userData.profile_picture.toString()}`;
      }

      res.status(200).json(userData);
    })
    .catch((err: Error) => {
      console.error('Error fetching user data:', err);
      res.status(500).send('Error fetching user data');
    });
});

// Upload profile picture
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

const buildUpdateQuery = (fields: Record<string, any>) => {
  const fieldsToUpdate = [];
  const values = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }
  }

  return { query: fieldsToUpdate.join(', '), values };
};

// Get all meals
router.get('/meals', authMiddleware, (req: Request, res: Response) => {
  const db = (req as any).db;
  const { search } = req.query; // Get the search query parameter

  let query = `
    SELECT 
      meals.id, 
      meals.name, 
      meals.description, 
      meals.ingredients, 
      meals.calories, 
      meals.protein, 
      meals.carbohydrates, 
      meals.fat, 
      meals.created_at, 
      users.username AS userName,
      COALESCE(AVG(reviews.rating), 0) AS averageRating -- Calculate the average rating
    FROM meals
    INNER JOIN users ON meals.user_id = users.id
    LEFT JOIN reviews ON meals.id = reviews.meal_id -- Join with the reviews table
    WHERE meals.visibility = TRUE
  `;

  const values: any[] = [];

  // Add search filtering if the search query is provided
  if (search) {
    query += `
      AND (
        meals.name LIKE ? OR
        meals.description LIKE ? OR
        users.username LIKE ?
      )
    `;
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  query += `
    GROUP BY meals.id, users.username -- Group by meal ID and username
    ORDER BY meals.created_at DESC
  `;

  db.query(query, values)
    .then(([rows]: [any[], any]) => {
      res.status(200).json(rows);
    })
    .catch((err: Error) => {
      console.error('Error fetching meals:', err);
      res.status(500).send('Error fetching meals');
    });
});

router.post('/reviews', authMiddleware, (req: Request, res: Response) => {
  const { meal_id, rating, comment } = req.body;
  const user_id = req.user?.id ?? (() => { throw new Error('User is not authenticated'); })(); // Ensure user is defined
  const db = (req as any).db; // Retrieve the db instance from the request object

  const query = `
    INSERT INTO Reviews (meal_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [meal_id, user_id, rating, comment])
    .then(() => res.status(201).send('Review created successfully'))
    .catch((err: Error) => {
      console.error('Error creating review:', err);
      res.status(500).send('Error creating review');
    });
});

// Get reviews for a meal
router.get('/reviews', authMiddleware, (req: Request, res: Response) => {
  const { meal_id } = req.query;
  const db = (req as any).db; // Retrieve the db instance from the request object

  const query = `
    SELECT r.review_id AS id, r.rating, r.comment, r.created_at, u.username AS userName
    FROM Reviews r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.meal_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [meal_id])
    .then(([rows]: [any[], any]) => res.status(200).json(rows))
    .catch((err: Error) => {
      console.error('Error fetching reviews:', err);
      res.status(500).send('Error fetching reviews');
    });
});

//Copy meal
router.post('/add-meal', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user; // Get the authenticated user
  const db = (req as any).db; // Get the database instance
  const { name, description, ingredients, calories, protein, carbohydrates, fat, visibility } = req.body;

  if (!user) {
    res.status(401).send('User not authenticated');
    return;
  }

  const query = `
    INSERT INTO meals (name, description, ingredients, calories, protein, carbohydrates, fat, visibility, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, ingredients, calories, protein, carbohydrates, fat, visibility ?? false, user.id])
    .then(() => {
      res.status(201).send('Meal added successfully');
    })
    .catch((err: Error) => {
      console.error('Error adding meal:', err);
      res.status(500).send('Error adding meal');
    });
});

export default router;



