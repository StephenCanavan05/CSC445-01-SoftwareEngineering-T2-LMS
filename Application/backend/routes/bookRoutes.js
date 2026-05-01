const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// get all books from catalog
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        console.error('error fetching books:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// search books by title or author
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Try entering a book!' });
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
        console.error('error searching books:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// get details for single book
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

// priveleged routes below - staff and admin only

// add new book and inventory
router.post('/', auth, checkRole(['staff', 'admin']), async (req, res) => {
    try {
        const { title, author, isbn, category, quantity, location } = req.body;

        // ensure all metadata is present
        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'title, author, and isbn required' });
        }

        // create the book record
        const newBook = await Book.create({
            title,
            author,
            isbn,
            category,
            availability: true
        });

        // create initial inventory
        await Inventory.create({
            book_id: newBook.book_id,
            quantity: quantity || 1,
            location: location || 'Main Gallery'
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('error adding book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// update a book's information
router.put('/:id', auth, checkRole(['staff', 'admin']), async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }

        // update with new data
        await book.update(req.body);
        res.json(book);
    } catch (error) {
        console.error('error updating book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// remove book from library
router.delete('/:id', auth, checkRole(['staff', 'admin']), async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }

        // destroy the book record
        await book.destroy();
        res.json({ message: 'book deleted successfully' });
    } catch (error) {
        console.error('error deleting book:', error);
        res.status(500).json({ message: 'server error' });
    }
});

module.exports = router;