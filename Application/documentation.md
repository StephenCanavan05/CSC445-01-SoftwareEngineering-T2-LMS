# LMS Backend

Backend: Jorge Bautista

## Installation & Setup
Follow these steps to get the server running on your local machine.

### 1. Prerequisites
- **Node.js**
- **PostgreSQL**

### 2. Environment Configuration
To Install Dependencies, navigate into the `Application/backend` folder and install the required modules:
```env
npm install
```
this may take a little.

Create a `.env` file in the `backend` folder. Use the following template:
```env
PORT=8000
DB_NAME=lms_db
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_DB_PASSWORD!
JWT_SECRET=dev_secret_key
```
There is also an .env.example file with this same information which you can edit.


### 3. Database Setup

The backend uses a PostgreSQL database. Follow these steps or rever to Jack's README to prepare your environment:

Create a database named lms_db in pgAdmin or psql.

Run the schema script: psql -d lms_db -f ../database/schema.sql

Run the seed script: psql -d lms_db -f ../database/seed.sql

### 4. Running the Server

To start the server with auto-reload (development mode):

```env
npm run dev
```

The server will be available at http://localhost:8000.

If successful, your terminal should display:

Database connection established.
Database models synchronized.
Server is running on port 8000

You can also run this in your browser as a health check:

GET http://localhost:8000/api/health

###################################

# Library Management System API


## Base URL
```
http://localhost:3000
```

## Authentication
Endpoints marked with 🔒 require a JWT token. Include it in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## User Endpoints

### Register
```
POST /users/register
```
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patron"
}
```

**Response:**
```json
{
  "message": "user registered"
}
```

---

### Login
```
POST /users/login
```
Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "name": "John Doe",
    "role": "patron"
  }
}
```

---

## Book Endpoints

### Get All Books
```
GET /books
```
Retrieve all books in the catalog.

**Response:**
```json
[
  {
    "book_id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "category": "Fiction",
    "availability": true
  }
]
```

---

### Search Books
```
GET /books/search?query={search_term}
```
Search books by title or author.

**Example:**
```
GET /books/search?query=Gatsby
```

**Response:**
```json
[
  {
    "book_id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "category": "Fiction",
    "availability": true
  }
]
```

---

### Get Book Details
```
GET /books/{book_id}
```
Get information about a specific book.

**Example:**
```
GET /books/1
```

**Response:**
```json
{
  "book_id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "category": "Fiction",
  "availability": true
}
```

---

### Add Book 🔒
```
POST /books
```
Add a new book to the catalog. **Staff/Admin only.**

**Request:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "category": "Fiction",
  "quantity": 5,
  "location": "Main Gallery"
}
```

**Response:**
```json
{
  "book_id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "category": "Fiction",
  "availability": true
}
```

---

### Update Book 🔒
```
PUT /books/{book_id}
```
Update book information. **Staff/Admin only.**

**Request:**
```json
{
  "title": "The Great Gatsby",
  "category": "Classic Fiction"
}
```

**Response:**
```json
{
  "book_id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "category": "Classic Fiction",
  "availability": true
}
```

---

### Delete Book 🔒
```
DELETE /books/{book_id}
```
Remove a book from the catalog. **Staff/Admin only.**

**Response:**
```json
{
  "message": "book deleted successfully"
}
```

---

## Loan Endpoints

### Get My Loans 🔒
```
GET /loans/my-loans
```
Get all loans for the authenticated user.

**Response:**
```json
[
  {
    "loan_id": 1,
    "user_id": 2,
    "book_id": 1,
    "borrow_date": "2026-01-15T10:30:00Z",
    "due_date": "2026-01-29T10:30:00Z",
    "return_date": null,
    "Book": {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald"
    }
  }
]
```

---

### Checkout Book 🔒
```
POST /loans
```
Borrow a book from the library.

**Request:**
```json
{
  "book_id": 1
}
```

**Response:**
```json
{
  "message": "checkout successful",
  "loan": {
    "loan_id": 5,
    "user_id": 2,
    "book_id": 1,
    "borrow_date": "2026-01-15T10:30:00Z",
    "due_date": "2026-01-29T10:30:00Z",
    "return_date": null
  }
}
```

---

### Return Book 🔒
```
PUT /loans/{loan_id}/return
```
Return a borrowed book to the library.

**Response:**
```json
{
  "message": "book returned successfully"
}
```

---

## Error Responses

| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid credentials | Login failed |
| 400 | No physical copies available | Book is out of stock |
| 404 | Book not found | Book ID doesn't exist |
| 404 | Loan not found | Loan ID doesn't exist |
| 500 | Server error | Internal server error |

---

## All Endpoints Reference

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/users/register` | Create new user | ❌ | — |
| POST | `/users/login` | Authenticate user | ❌ | — |
| GET | `/books` | Get all books | ❌ | — |
| GET | `/books/search?query={term}` | Search books by title/author | ❌ | — |
| GET | `/books/{id}` | Get book details | ❌ | — |
| POST | `/books` | Add new book | ✅ | Staff, Admin |
| PUT | `/books/{id}` | Update book | ✅ | Staff, Admin |
| DELETE | `/books/{id}` | Delete book | ✅ | Staff, Admin |
| GET | `/loans/my-loans` | Get user's loans | ✅ | — |
| POST | `/loans` | Checkout book | ✅ | — |
| PUT | `/loans/{id}/return` | Return book | ✅ | — |

---

## Quick Start Example

**1. Register**
```javascript
const registerRes = await fetch('http://localhost:3000/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'patron'
  })
});
```

**2. Login**
```javascript
const loginRes = await fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jane@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();
```

**3. Search Books**
```javascript
const booksRes = await fetch('http://localhost:3000/books/search?query=Gatsby');
const books = await booksRes.json();
```

**4. Checkout Book**
```javascript
const checkoutRes = await fetch('http://localhost:3000/loans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ book_id: 1 })
});
```
