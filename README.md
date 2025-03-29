# TryGamble Backend

## Overview
TryGamble is a backend service for an iGaming platform where users can experience gambling without real money. The API provides authentication, coin flipping, user balance tracking, and more.

### Hosted URL
[https://trygambling.up.railway.app/](https://trygambling.up.railway.app/)

### Repository URL
[https://github.com/V-Satwik-Reddy/TryGambling/](https://github.com/V-Satwik-Reddy/TryGambling/)

---

## API Endpoints

### Authentication
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | `/auth/signup`          | User registration   |
| POST   | `/auth/login`           | User login          |
| GET    | `/auth/google`          | Google OAuth login  |
| GET    | `/auth/google/callback` | Google OAuth callback |
| GET    | `/auth/verify`          | Verify user session |
| GET    | `/auth/logout`          | User logout         |

### Game Actions
| Method | Endpoint     | Description              |
|--------|-------------|--------------------------|
| POST   | `/coin/flip` | Flip a coin for a bet    |

### User Actions
| Method | Endpoint       | Description                 |
|--------|---------------|-----------------------------|
| GET    | `/user/claim`  | Claim daily rewards        |
| GET    | `/user/profile` | Get user profile details  |
| GET    | `/user/balance` | Get user balance          |

### Miscellaneous
| Method | Endpoint       | Description                     |
|--------|---------------|---------------------------------|
| GET    | `/`           | API root endpoint              |
| GET    | `/api/routes` | List all available API routes  |

---

## Environment Variables
To run this project, configure the following environment variables in a `.env` file:

```
PORT=8000
MONGO_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
REDIS_URL=<your_redis_connection_url>
```

---

## Installation & Setup

### Prerequisites
- Node.js
- MongoDB
- Redis (optional, if using caching)

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/V-Satwik-Reddy/TryGambling.git
   cd TryGambling
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and configure environment variables.
4. Start the server:
   ```sh
   npm start
   ```
5. The API will be available at `http://localhost:8000/`.

---

## Deployment
To deploy this backend, use platforms like **Railway, Render, or AWS**.

For Railway, configure environment variables in the **Railway Dashboard** under `Settings > Variables`.

---

## Contributing
Feel free to contribute! Fork the repo, make changes, and submit a PR.

---

## License
This project is licensed under the MIT License.

