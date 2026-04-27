-- ============================================================
-- LMS Sample Data for Testing
-- ============================================================

INSERT INTO users (name, email, password, role) VALUES
    ('Alice Patron', 'alice@library.edu', 'hashed_pw_1', 'patron'),
    ('Bob Staff',    'bob@library.edu',   'hashed_pw_2', 'staff'),
    ('Carol Admin',  'carol@library.edu', 'hashed_pw_3', 'admin');

INSERT INTO books (title, author, isbn, category) VALUES
    ('Clean Code',               'Robert C. Martin', '9780132350884', 'Computer Science'),
    ('The Pragmatic Programmer', 'David Thomas',     '9780135957059', 'Computer Science'),
    ('Dune',                     'Frank Herbert',    '9780441013593', 'Science Fiction');

INSERT INTO inventory (book_id, quantity, location) VALUES
    (1, 3, 'Shelf A1'),
    (2, 2, 'Shelf A2'),
    (3, 5, 'Shelf B1');

INSERT INTO loans (user_id, book_id, borrow_date, due_date) VALUES
    (1, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days');

INSERT INTO reservations (user_id, book_id, status) VALUES
    (2, 2, 'pending');