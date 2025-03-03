import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mealRoutes from "../meal-api/src/routes/mealRoutes";
import userRoutes from "../meal-api/src/routes/userRoutes";
import { saveUsersToDatabase } from "../meal-api/src/controllers/userController"; // Import the saveUsersToDatabase function

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Middleware to attach the database pool to the request object
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).db = db;
  next();
});

app.use(bodyParser.json()); // Parse incoming JSON data

// Use meal routes
app.use('/api/meals', mealRoutes);

// Use user routes
app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Meal API');
});

// Starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await db.getConnection();
    console.log("Connected to MySQL database.");
    console.log(`Server running on port ${PORT}`);

    // Save users to database when the server starts
    await saveUsersToDatabase();
  } catch (err) {
    console.error("Database connection failed: ", err);
    process.exit(1); // Exit the process with failure
  }
});