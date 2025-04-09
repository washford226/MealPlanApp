import { Router, Request, Response } from 'express';

// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}
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

<<<<<<< Updated upstream
// Signup user
router.post('/signup', upload.single('profile_picture'), async (req: Request, res: Response): Promise<void> => {
=======
router.post('/signup', upload.single('profile_picture'), (req: Request, res: Response) => {
>>>>>>> Stashed changes
  const { username, email, password, calories_goal, dietary_restrictions } = req.body;
  const profilePicture = req.file?.buffer;
  const db = (req as any).db;

  // Validate file type
  if (req.file && !['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    res.status(400).send({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
  }

  // Validate file size
  if (req.file && req.file.size > 5 * 1024 * 1024) { // 5 MB limit
    res.status(400).send({ message: 'File size exceeds the limit of 5 MB.' });
    return;
  }

  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email])
    .then(async ([rows]: [User[], any]) => {
      if (rows.length > 0) {
        return res.status(400).send({ message: 'Username or email already exists' });
      }

      return bcrypt.hash(password, 10);
    })
    .then(async (hashedPassword: string) => {
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

<<<<<<< Updated upstream
      const userData = rows[0];

      // Convert the profile_picture BLOB to a Base64 string
      if (userData.profile_picture) {
        const buffer = Buffer.isBuffer(userData.profile_picture)
            ? userData.profile_picture
            : Buffer.from(userData.profile_picture as string);
        userData.profile_picture = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      }

      res.status(200).json(userData);
=======
      res.status(200).json(rows[0]);
>>>>>>> Stashed changes
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

router.post('/meals', authMiddleware, (req: Request, res: Response) => {
  console.log("Request Body:", req.body); // Debugging: Log the request body

  const { name, description, ingredients, calories, protein, carbohydrates, fat } = req.body.meal || {};
  const user_id = req.user?.id; // Ensure the user is authenticated
  const db = (req as any).db;

  if (!user_id) {
    res.status(401).send('User is not authenticated');
    return;
  }

  if (!name || !description || !ingredients) {
    res.status(400).send('Missing required fields');
    return;
  }

  const query = `
    INSERT INTO meals (name, description, ingredients, calories, protein, carbohydrates, fat, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name,
    description,
    JSON.stringify(ingredients), // Convert array to string
    calories,
    protein,
    carbohydrates,
    fat,
    user_id,
  ];

  db.query(query, values)
    .then(() => {
      res.status(201).send('Meal added successfully');
    })
    .catch((err: Error) => {
      console.error("Error adding meal:", err);
      res.status(500).send('Error adding meal');
    });
});


// Add a meal to the meal plan
router.post('/meal-plan', authMiddleware, (req: Request, res: Response): void => {
  const { meal_id, date, meal_type } = req.body; // Extract data from the request body
  const db = (req as any).db; // Get the database instance

  // Validate the input
  if (!meal_id || !date || !meal_type) {
    res.status(400).send('Meal ID, date, and meal type are required');
    return;
  }

  // Ensure the meal_type is valid
  const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Other'];
  if (!validMealTypes.includes(meal_type)) {
    res.status(400).send(`Invalid meal type. Valid types are: ${validMealTypes.join(', ')}`);
    return;
  }

  const query = `
    INSERT INTO meal_plans (meal_id, date, meal_type)
    VALUES (?, ?, ?)
  `;

  db.query(query, [meal_id, date, meal_type])
    .then(() => {
      res.status(201).send('Meal added to the meal plan successfully');
    })
    .catch((err: Error) => {
      console.error('Error adding meal to the meal plan:', err);
      res.status(500).send('Error adding meal to the meal plan');
    });
});

// Get meals for the current user (without reviews)
router.get('/my-meals', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user; // Get the authenticated user
  const db = (req as any).db; // Get the database instance
  const { search } = req.query; // Get the search query parameter

  if (!user) {
    res.status(401).send('User not authenticated');
    return;
  }

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
      meals.created_at
    FROM meals
    WHERE meals.user_id = ? -- Filter by the current user's ID
  `;

  const values: any[] = [user.id];

  // Add search filtering if the search query is provided
  if (search) {
    query += `
      AND (
        meals.name LIKE ? OR
        meals.description LIKE ?
      )
    `;
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm);
  }

  query += `
    ORDER BY meals.created_at DESC
  `;

  try {
    const [rows]: [any[], any] = await db.query(query, values);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching user meals:', err);
    res.status(500).send('Error fetching user meals');
  }
});

// Add a meal to the meal plan
router.post('/meal-plan', authMiddleware, (req: Request, res: Response): void => {
  const { meal_id, date, meal_type } = req.body; // Extract data from the request body
  const db = (req as any).db; // Get the database instance

  // Validate the input
  if (!meal_id || !date || !meal_type) {
    res.status(400).send('Meal ID, date, and meal type are required');
    return;
  }

  // Ensure the meal_type is valid
  const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Other'];
  if (!validMealTypes.includes(meal_type)) {
    res.status(400).send(`Invalid meal type. Valid types are: ${validMealTypes.join(', ')}`);
    return;
  }

  const query = `
    INSERT INTO Meal_Plan (meal_id, date, meal_type)
    VALUES (?, ?, ?)
  `;

  db.query(query, [meal_id, date, meal_type])
    .then(() => {
      res.status(201).send('Meal added to the meal plan successfully');
    })
    .catch((err: Error) => {
      console.error('Error adding meal to the meal plan:', err);
      res.status(500).send('Error adding meal to the meal plan');
    });
});

router.get('/meal-plan', authMiddleware, (req: Request, res: Response): void => {
  const { date } = req.query; // Extract the date from the query parameters
  const db = (req as any).db; // Get the database instance

  if (!date) {
    res.status(400).send('Date is required');
    return;
  }

  const query = `
    SELECT mp.meal_plan_id, mp.date, mp.meal_type, m.name, m.description, m.calories, m.protein, m.carbohydrates, m.fat
    FROM Meal_Plan mp
    INNER JOIN meals m ON mp.meal_id = m.id
    WHERE mp.date = ?
    ORDER BY FIELD(mp.meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Other')
  `;

  db.query(query, [date])
    .then(([rows]: [any[], any]) => {
      res.status(200).json(rows);
    })
    .catch((err: Error) => {
      console.error('Error fetching meals for the date:', err);
      res.status(500).send('Error fetching meals for the date');
    });
});

router.get('/meal-plan-range', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query; // Extract the date range from the query parameters
  const db = (req as any).db; // Get the database instance

  if (!startDate || !endDate) {
    res.status(400).send('Start date and end date are required');
    return;
  }

  const query = `
    SELECT mp.meal_plan_id, mp.date, mp.meal_type, m.name, m.description, m.calories, m.protein, m.carbohydrates, m.fat
    FROM Meal_Plan mp
    INNER JOIN meals m ON mp.meal_id = m.id
    WHERE mp.date BETWEEN ? AND ?
    ORDER BY mp.date ASC, FIELD(mp.meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Other')
  `;

  try {
    const [rows]: [any[], any] = await db.query(query, [startDate, endDate]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching meals for the date range:', err);
    res.status(500).send('Error fetching meals for the date range');
  }
});

router.put('/meal-plan/:meal_plan_id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { meal_plan_id } = req.params; // Extract the meal_plan_id from the URL
  const { date, meal_type } = req.body; // Extract the updated fields from the request body
  const db = (req as any).db; // Get the database instance

  if (!date || !meal_type) {
    res.status(400).send('Date and meal type are required');
    return;
  }

  const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Other'];
  if (!validMealTypes.includes(meal_type)) {
    res.status(400).send(`Invalid meal type. Valid types are: ${validMealTypes.join(', ')}`);
    return;
  }

  const query = `
    UPDATE Meal_Plan
    SET date = ?, meal_type = ?
    WHERE meal_plan_id = ?
  `;

  try {
    await db.query(query, [date, meal_type, meal_plan_id]);
    res.status(200).send('Meal plan updated successfully');
  } catch (err) {
    console.error('Error updating meal plan:', err);
    res.status(500).send('Error updating meal plan');
  }
});

router.delete('/meal-plan/:meal_plan_id', authMiddleware, (req: Request, res: Response) => {
  const { meal_plan_id } = req.params; // Extract the meal_plan_id from the URL
  const db = (req as any).db; // Get the database instance

  const query = `
    DELETE FROM Meal_Plan
    WHERE meal_plan_id = ?
  `;

  db.query(query, [meal_plan_id])
    .then(() => {
      res.status(200).send('Meal removed from the meal plan successfully');
    })
    .catch((err: Error) => {
      console.error('Error removing meal from the meal plan:', err);
      res.status(500).send('Error removing meal from the meal plan');
    });
});

router.delete('/meal-plan-clear', authMiddleware, (req: Request, res: Response) => {
  const { date } = req.body; // Extract the date from the request body
  const db = (req as any).db; // Get the database instance

  if (!date) {
    res.status(400).send('Date is required');
    return;
  }

  const query = `
    DELETE FROM Meal_Plan
    WHERE date = ?
  `;

  db.query(query, [date])
    .then(() => {
      res.status(200).send('Meal plan cleared for the date');
    })
    .catch((err: Error) => {
      console.error('Error clearing meal plan:', err);
      res.status(500).send('Error clearing meal plan');
    });
});

// Define the foodData object with nutritional information
const foodData: Record<string, any> = {
  apple: {
    calories: 52,
    protein: 0.3,
    carbohydrates: 14,
    fat: 0.2,
  },
  banana: {
    calories: 96,
    protein: 1.3,
    carbohydrates: 27,
    fat: 0.3,
  },
  chicken: {
    calories: 239,
    protein: 27,
    carbohydrates: 0,
    fat: 14,
  },
  // Add more foods as needed
};

// API Endpoint to retrieve nutritional information for foods via query parameters
router.get('/v1/foods', (req: Request, res: Response): void => {
  const foodName = req.query.food?.toString().toLowerCase();

  if (foodName && foodData[foodName]) {
    res.status(200).json({
      food: foodName,
      nutrition: foodData[foodName],
    });
  } else {
    res.status(404).json({
      error: 'Food not found. Please provide a valid food name.',
    });
  }
});

export default router;