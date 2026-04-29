const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// get all books from the database
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        console.error('error fetching books:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// get a single book using its id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        
        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('error fetching book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// add a new book to the database
router.post('/', async (req, res) => {
    try {
        const { title, author, isbn, category } = req.body;

        // basic check to ensure required data is present
        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'title, author, and isbn are required' });
        }

        const newBook = await Book.create({
            title,
            author,
            isbn,
            category
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('error adding book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// update an existing book's information
router.put('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }

        // update the book with whatever data was sent in the request body
        await book.update(req.body);
        res.json(book);
    } catch (error) {
        console.error('error updating book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// remove a book from the database
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }

        await book.destroy();
        res.json({ message: 'book deleted successfully' });
    } catch (error) {
        console.error('error deleting book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

module.exports = router;