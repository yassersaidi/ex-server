# Ex-Server

Ex-Server is a Node.js and TypeScript server application using Express.js, PostgreSQL with Prisma as an ORM, and Jest for testing. The server includes features such as user authentication, input validation, email verification, and rate limiting.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Testing](#testing)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yassersaidi/ex-server.git
   cd ex-server
   ```

2. Install dependencies:

```bash
Copy code
npm install
```
## Setup:
 1. Create a .env file in the root directory of the project and add the required environment variables:
    ```env
    SERVER_PORT=3001
    DATABASE_URL=postgresql://user:password@localhost:5432/yourdatabase
    PASSWORD_SALT="13"
    JWT_SECRET="your_jwt_secret"
    JWT_EXPIRES_IN="15min"
    JWT_REFRESH_TOKEN_SECRET="your_refresh_token_secret"
    JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
    RESEND_API_KEY="your_resend_api_key"
    ```

2. Set up your PostgreSQL database and run Prisma migrations:

```bash
npx prisma migrate dev
```
3. Generate Prisma client:
```bash
npx prisma generate
```
## Usage:
Start the development server:
```bash
npm run dev
```
The server will be running at http://localhost:3001.

### Available Routes
* **POST /auth/register** - Register a new user
* **POST /auth/login** - User login
* **POST /auth/verify-email** - Verify email address
* **POST /auth/verify-code** - Validate user
* **POST /auth/forgot-password** - Request password reset
* **POST /auth/reset-password** - Reset the user password
* **POST /auth/rt** - Refresh access token
* **POST /auth/logout** - Logout the user


## Testing:
To run tests, use the following command:
```bash
npm run test
```



