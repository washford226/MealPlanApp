## Meal Plan App

This is a full-stack application for managing meal plans, including features like user authentication, dietary restrictions, calorie goals, and profile management.

---

### **Get Started**

#### 1. Install Dependencies

Install the required dependencies for both the backend and frontend.

```bash
# Install dependencies
npm install
```

#### 2. Set Up the Database

Make sure you have MySQL installed and running. Create a database and the required tables:

```sql
CREATE DATABASE meal_plan_app;

USE meal_plan_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    calories_goal INT DEFAULT NULL,
    dietary_restrictions TEXT DEFAULT NULL,
    profile_picture BLOB DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

... -- (Check SQl file for all tables)
```

#### 3. Configure Environment Variables

Make sure that the env file is correct with all of your data:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=meal_plan_app
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

Replace `yourpassword`, `your_jwt_secret`, `your_email@gmail.com`, and `your_email_password` with your actual database credentials and email configuration.

#### 4. Start the Backend Server

Navigate to the `backend` directory and start the server:

```bash
cd backend
npm run server
```

#### 5. Start the Frontend App

Navigate to the `frontend` directory and start the app:

```bash
npx expo start
```
Run on an Android emulator for the best experience. 
If running on the web, please note that errors may not display properly and could cause the server to stop unexpectedly. 
Exercise caution and ensure all inputs and actions are correct when using the web version.
---

### **Dependencies**

#### Backend Dependencies:
- `express`: Web framework for building the backend API.
- `@types/express`: TypeScript type definitions for Express.
- `bcrypt`: For hashing passwords securely.
- `jsonwebtoken`: For generating and verifying JWT tokens.
- `mysql2`: For interacting with the MySQL database.
- `dotenv`: For managing environment variables.
- `multer`: For handling file uploads (e.g., profile pictures).
- `nodemailer`: For sending emails (e.g., forgot password functionality).

#### Frontend Dependencies:
- `react-native`: Core library for building mobile apps.
- `react-native-vector-icons`: For using icons in the app.
- `axios`: For making HTTP requests to the backend API.
- `@react-native-async-storage/async-storage`: For storing data locally on the device.
- `react-navigation`: For handling navigation between screens.
- `react-navigation-stack`: For stack-based navigation.
- `react-navigation-tabs`: For tab-based navigation.

#### Development Dependencies:
- `typescript`: For TypeScript support.
- `@types/react`: Type definitions for React.
- `@types/react-native`: Type definitions for React Native.
- `@types/node`: Type definitions for Node.js.
- `@types/bcrypt`: Type definitions for `bcrypt`.
- `@types/jsonwebtoken`: Type definitions for `jsonwebtoken`.
- `@types/react-navigation`: Type definitions for `react-navigation`.
- `@types/react-native-vector-icons`: Type definitions for `react-native-vector-icons`.

---

### **Features**
- User authentication (login, signup, and JWT-based authorization).
- Profile management (edit dietary restrictions, calorie goals, and profile picture).
- Password management (change password functionality).
- Forgot password functionality (via email).
- Meal plan calendar with navigation.

---

### **Troubleshooting**
- **Database Connection Issues:** Ensure your `.env` file is correctly configured and the MySQL server is running.
- **Expo Issues:** If `npx expo start` fails, ensure you have Expo CLI installed globally:
  ```bash
  npm install -g expo-cli
  ```
- **Backend Errors:** Use tools like Postman to test API endpoints and debug issues.

---

### **Contributing**
Feel free to fork this repository and submit pull requests for improvements or bug fixes.

---

### **License**
This project is licensed under the MIT License.