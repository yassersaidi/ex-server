# Ex-Server 

Ex-Server is a Node.js and TypeScript server application using Express.js, PostgreSQL with Prisma as an ORM, and Jest for testing. The server includes features such as user authentication, input validation, email verification, and rate limiting.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Testing](#testing)
- [Docker](#docker)

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
 1. Create a .env file in the root directory of the project and add the required environment variables:(check [.env.example](https://github.com/yassersaidi/ex-server/blob/main/.env.example))
    

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

## Available Routes

### Authentication Routes

| Method | Endpoint             | Request Body                                                                                              | Response                                                      |
|--------|----------------------|-----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| POST   | /auth/login          | `{ "email": "user@example.com", "password": "password123" }`                                           | `{ "accessToken": "token", "user": { "id": "userId", "email": "user@example.com", "username": "username" } }` |
| POST   | /auth/register       | `{ "email": "user@example.com", "username": "username", "password": "password123" }`                   | `{ "userId": "newUserId" }`                                  |
| POST   | /auth/verify-email   | `{ "email": "user@example.com" }`                                                                       | `{ "message": "Verification code sent!" }`                   |
| POST   | /auth/verify-code    | `{ "email": "user@example.com", "code": "123456" }`                                                     | `{ "message": "User successfully verified" }`                |
| POST   | /auth/forgot-password| `{ "email": "user@example.com" }`                                                                       | `{ "message": "Password reset code sent!" }`                 |
| POST   | /auth/reset-password | `{ "email": "user@example.com", "code": "123456", "password": "newPassword123" }`                      | `{ "message": "Password successfully reset" }`              |
| POST   | /auth/rt             | (No request body; token is retrieved from cookies)                                                       | `{ "accessToken": "newAccessToken" }`                        |
| POST   | /auth/logout         | (No request body; token is retrieved from cookies)                                                       | `{ "message": "Logged out successfully." }`                 |


### User Routes

| Method | Endpoint            | Request Body                                                                                   | Response                                                        |
|--------|---------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| GET    | /user/all           | `{ "userId": "userId" }`                                                                       | `[ { "id": "userId", "email": "user@example.com", "username": "username", "createdAt": "2024-01-01T00:00:00Z", "verified": true, "profilePicture": "url" }, ... ]` |
| GET    | /user/me            | `{ "userId": "userId" }`                                                                       | `{ "id": "userId", "email": "user@example.com", "username": "username", "createdAt": "2024-01-01T00:00:00Z", "verified": true, "profilePicture": "url" }` |
| GET    | /user/get/:username | `{ "userId": "userId" }`                                                                       | `{ "id": "userId", "email": "user@example.com", "username": "username", "createdAt": "2024-01-01T00:00:00Z", "verified": true, "profilePicture": "url" }` |
| PUT    | /user/username      | `{ "userId": "userId", "username": "newUsername" }`                                          | `{ "id": "userId", "email": "user@example.com", "username": "newUsername", "createdAt": "2024-01-01T00:00:00Z", "verified": true, "profilePicture": "url" }` |
| PUT    | /user/update-image  | `{ "userId": "userId" }` (Image uploaded via form-data)                                        | `{ "message": "Image updated successfully", "updatedUser": { "id": "userId", "email": "user@example.com", "username": "username", "createdAt": "2024-01-01T00:00:00Z", "verified": true, "profilePicture": "url" } }` |
| GET    | /user/search        | `{ "query": "searchTerm" }`                                                                    | `[ { "id": "userId", "email": "user@example.com", "username": "username", "createdAt": "2024-01-01T00:00:00Z", "profilePicture": "url", "verified": true }, ... ]` |
| DELETE | /user/              | `{ "userId": "userId" }`                                                                       | `{ "count": 1 }`                                                |
### Notes:
- **Request Body**: For endpoints without a request body (like `/auth/rt` and `/auth/logout`), the table indicates that the token is retrieved from cookies.
- **Response**: Includes possible messages or data returned for each endpoint. Ensure that these match your actual API responses.
- **Error Handling**: Error responses are generalized. Customize them based on the specifics of your application and its error handling.

## Testing:
To run tests, use the following command:
```bash
npm run test
```

## Docker:
To set up and run your application with Docker, just run this commande:
```bash
docker-compose up --build
```

