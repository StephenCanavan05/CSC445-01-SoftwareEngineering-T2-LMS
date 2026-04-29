const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth'); // Added for security

// get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get a single book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// add a new book (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { title, author, isbn, category, total_copies } = req.body;

        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'Title, author, and isbn are required' });
        }

        const newBook = await Book.create({
            title,
            author,
            isbn,
            category,
            total_copies: total_copies || 1,
            available_copies: total_copies || 1 // Initialize inventory
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 4. Update a book (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await book.update(req.body);
        res.json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// remove a book (Protected if on a loan)
router.delete('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        
        await book.destroy();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;