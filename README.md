# Gamble Backend API

## Overview
The backend for the **Gamble** project provides authentication, user management, and coin flip game functionality. This API allows users to register, log in, manage their balance, and participate in games.

### **Base URL**
[https://trygambling.up.railway.app/](https://trygambling.up.railway.app/)

---

## **API Endpoints**

### **Authentication Routes**
| Method | Endpoint                | Description                     |
|--------|-------------------------|---------------------------------|
| POST   | `/auth/signup`          | User registration              |
| POST   | `/auth/login`           | User login                     |
| GET    | `/auth/google`          | Google OAuth login             |
| GET    | `/auth/google/callback` | Google OAuth callback          |
| GET    | `/auth/verify`          | Verify user authentication     |
| GET    | `/auth/logout`          | Log out user                   |

### **Game Routes**
| Method | Endpoint     | Description          |
|--------|------------|----------------------|
| POST   | `/coin/flip` | Flip a coin (gambling feature) |

### **User Routes**
| Method | Endpoint       | Description         |
|--------|---------------|---------------------|
| GET    | `/user/claim`  | Claim rewards       |
| GET    | `/user/profile`| Get user profile   |
| GET    | `/user/balance`| Get user balance   |

### **Miscellaneous Routes**
| Method | Endpoint        | Description                 |
|--------|----------------|-----------------------------|
| GET    | `/`            | API root                    |
| GET    | `/api/routes`  | Fetch all available routes  |

---

## **Deployment**
The backend is hosted on **Railway**:  
[https://trygambling.up.railway.app/](https://trygambling.up.railway.app/)

---

## **Setup & Usage**
### **Installation**
```sh
# Clone the repository
git clone <repo-url>
cd Gamble-Backend

# Install dependencies
npm install
```

### **Running the Server**
```sh
# Development mode
npm run dev

# Production mode
npm start
```

### **Environment Variables**
Ensure you have a `.env` file with the necessary environment variables for authentication and database configuration.

---

## **Contributing**
Feel free to contribute by submitting issues or pull requests!

---

## **License**
This project is licensed under the MIT License.

