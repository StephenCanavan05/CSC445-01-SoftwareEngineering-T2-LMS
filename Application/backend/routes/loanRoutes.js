// import express router
const express = require('express');
const router = express.Router();
// import models and auth
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const auth = require('../middleware/auth');

// get loans for logged in user
router.get('/my-loans', auth, async (req, res) => {
    try {
        // find loans matching user id
        const loans = await Loan.findAll({
            where: { user_id: req.user.id },
            // join book data to loan
            include: [{
                model: Book,
                attributes: ['title', 'author']
            }]
        });
        // send loan history
        res.json(loans);
    } catch (error) {
        // log error for debugging
        console.error('error fetching user loans:', error);
        // send server error
        res.status(500).json({ message: 'server error' });
    }
});

// checkout a book
router.post('/', auth, async (req, res) => {
    try {
        // get book id from request
        const { book_id } = req.body;
        const user_id = req.user.id; 

        // check physical inventory availability
        const inventoryItem = await Inventory.findOne({ where: { book_id } });

        // block if out of stock
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return res.status(400).json({ message: 'no physical copies available' });
        }

        // create new loan record
        const newLoan = await Loan.create({
            book_id,
            user_id,
            borrow_date: new Date(),
            // set due date 14 days out
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });

        // decrement inventory by one
        await inventoryItem.decrement('quantity', { by: 1 });

        // send success response
        res.status(201).json({ message: 'checkout successful', loan: newLoan });
    } catch (error) {
        // log error for debugging
        console.error('checkout error:', error);
        // send server error
        res.status(500).json({ message: 'server error' });
    }
});

// return a book
router.put('/:id/return', auth, async (req, res) => {
    try {
        // find loan by id
        const loan = await Loan.findByPk(req.params.id);
        if (!loan) return res.status(404).json({ message: 'loan not found' });
        // block if already returned
        if (loan.return_date) return res.status(400).json({ message: 'book already returned' });

        // find inventory
        const inventoryItem = await Inventory.findOne({ where: { book_id: loan.book_id } });
        if (inventoryItem) {
            // add book back to stock
            await inventoryItem.increment('quantity', { by: 1 });
        }

        // set return date
        await loan.update({ return_date: new Date() });
        res.json({ message: 'book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'server error' });
    }
});

module.exports = router;