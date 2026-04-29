const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory'); // New import
const auth = require('../middleware/auth');

// get loans for logged in user
router.get('/my-loans', auth, async (req, res) => {
    try {
        // find loans matching user id
        const loans = await Loan.findAll({
            where: { user_id: req.user.id },
            // join book data to loan record
            include: [{
                model: Book,
                attributes: ['title', 'author']
            }]
        });

        // send loan history to client
        res.json(loans);
    } catch (error) {
        // log the error for debugging
        console.error('error fetching user loans:', error);
        // send server error response
        res.status(500).json({ message: 'server error' });
    }
});

// create a new loan (Checking out a book)
router.post('/', auth, async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.id; 

        // check physical inventory instead of the book table
        const inventoryItem = await Inventory.findOne({ where: { book_id } });

        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return res.status(400).json({ message: 'No physical copies available in inventory' });
        }

        // create the loan record
        const newLoan = await Loan.create({
            book_id,
            user_id,
            borrow_date: new Date(),
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'active'
        });

        // decrement by 1
        await inventoryItem.decrement('quantity', { by: 1 });

        res.status(201).json({ message: 'Checkout successful', loan: newLoan });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// update a loan (Returning a book)
router.put('/:id', auth, async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        if (req.body.status === 'returned' && loan.status !== 'returned') {
            // Find inventory increment by 1
            const inventoryItem = await Inventory.findOne({ where: { book_id: loan.book_id } });
            if (inventoryItem) {
                await inventoryItem.increment('quantity', { by: 1 });
            }
            req.body.return_date = new Date();
        }

        await loan.update(req.body);
        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;