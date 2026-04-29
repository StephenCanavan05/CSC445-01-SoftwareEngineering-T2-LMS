const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');

// get all books from the catalog
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// search for books by title or author
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'search query is required' });
        }

        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { author: { [Op.iLike]: `%${query}%` } }
                ]
            }
        });

        res.json(books);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get details for a single book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// add a new book and initialize its inventory
router.post('/', auth, async (req, res) => {
    try {
        const { title, author, isbn, category, quantity, location } = req.body;

        // ensure all required data is present
        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'Title, author, and isbn are required' });
        }

        // create the book metadata
        const newBook = await Book.create({
            title,
            author,
            isbn,
            category,
            availability: true
        });

        // create the record in the inventory table
        await Inventory.create({
            book_id: newBook.book_id,
            quantity: quantity || 1,
            location: location || 'Main Gallery'
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// update a book's information
router.put('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // update the metadata based on the request body
        await book.update(req.body);
        res.json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// remove a book from the library
router.delete('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // remove the book metadata
        await book.destroy();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;