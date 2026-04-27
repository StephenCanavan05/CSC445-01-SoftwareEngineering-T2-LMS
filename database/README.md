# LMS Database

PostgreSQL schema for the Library Management System (CSC445 Team 2).
Database Engineer: Jack Gustafson

## Tables
- `users` — patrons, staff, and admins
- `books` — catalog entries
- `inventory` — physical copy counts and shelf locations
- `loans` — borrow/return records
- `reservations` — hold and waitlist records
- `fines` — overdue penalties

## Setup

1. Install PostgreSQL
2. Create the database:
```bash
   createdb lms_db
```
3. Run the schema:
```bash
   psql -d lms_db -f schema.sql
```
4. Load sample data (optional):
```bash
   psql -d lms_db -f seed.sql
```

## Notes
- Passwords are stored as hashed strings — never plaintext
- `books.availability` should be updated by the backend when `inventory.quantity` reaches 0
- `fines.loan_id` links each fine back to the loan that caused it