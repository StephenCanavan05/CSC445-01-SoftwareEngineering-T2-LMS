const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

// get a list of all current loans
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.findAll();
        res.json(loans);
    } catch (error) {
        console.error('error fetching loans:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// get details for a specific loan record
router.get('/:id', async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);
        
        if (!loan) {
            return res.status(404).json({ message: 'loan record not found' });
        }
        
        res.json(loan);
    } catch (error) {
        console.error('error fetching loan details:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// create a new loan (checking out a book)
router.post('/', async (req, res) => {
    try {
        const { book_id, user_id, loan_date } = req.body;

        // make sure we have a book id and user id
        if (!book_id || !user_id) {
            return res.status(400).json({ message: 'book_id and user_id are required' });
        }

        const newLoan = await Loan.create({
            book_id,
            user_id,
            loan_date: loan_date || new Date(),
            status: 'active'
        });

        res.status(201).json(newLoan);
    } catch (error) {
        console.error('error creating loan:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// update a loan (useful for marking a book as 'returned')
router.put('/:id', async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'loan record not found' });
        }

        // if the status is being changed to returned, we could set the return_date here
        if (req.body.status === 'returned' && !req.body.return_date) {
            req.body.return_date = new Date();
        }

        await loan.update(req.body);
        res.json(loan);
    } catch (error) {
        console.error('error updating loan:', error);
        res.status(500).json({ message: 'server error' });
    }
});

// delete a loan record
router.delete('/:id', async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'loan record not found' });
        }

        await loan.destroy();
        res.json({ message: 'loan record deleted successfully' });
    } catch (error) {
        console.error('error deleting loan:', error);
        res.status(500).json({ message: 'server error' });
    }
});

module.exports = router;