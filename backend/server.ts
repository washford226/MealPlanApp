import express, { Request, Response } from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connects to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, //There is no password set however if we wanted one this processes it, this will work.
  database: process.env.DB_NAME,
});

//Ensure that database is connected.
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
