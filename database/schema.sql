-- ============================================================
-- Library Management System - Database Schema
-- CSC445 Team 2 - Database Engineer: Jack Gustafson
-- PostgreSQL
-- ============================================================

CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(100)  NOT NULL,
    email          VARCHAR(150)  UNIQUE NOT NULL,
    password       VARCHAR(255)  NOT NULL,
    role           VARCHAR(20)   NOT NULL CHECK (role IN ('patron', 'staff', 'admin')),
    account_status VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended')),
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    book_id      SERIAL PRIMARY KEY,
    title        VARCHAR(255)  NOT NULL,
    author       VARCHAR(150)  NOT NULL,
    isbn         VARCHAR(20)   UNIQUE NOT NULL,
    category     VARCHAR(100),
    availability BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    book_id      INT  NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    quantity     INT  NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    location     VARCHAR(100)
);

CREATE TABLE loans (
    loan_id     SERIAL PRIMARY KEY,
    user_id     INT  NOT NULL REFERENCES users(user_id),
    book_id     INT  NOT NULL REFERENCES books(book_id),
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date    DATE NOT NULL,
    return_date DATE
);

CREATE TABLE reservations (
    reservation_id   SERIAL PRIMARY KEY,
    user_id          INT  NOT NULL REFERENCES users(user_id),
    book_id          INT  NOT NULL REFERENCES books(book_id),
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'))
);

CREATE TABLE fines (
    fine_id     SERIAL PRIMARY KEY,
    user_id     INT           NOT NULL REFERENCES users(user_id),
    loan_id     INT           REFERENCES loans(loan_id),
    amount      NUMERIC(6,2)  NOT NULL CHECK (amount >= 0),
    status      VARCHAR(20)   NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    issued_date DATE          NOT NULL DEFAULT CURRENT_DATE
);