const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// get all active loans for the logged-in user
router.get('/my-loans', auth, async (req, res) => {
    try {
        const loans = await Loan.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Book, attributes: ['title', 'author'] }]
        });
        res.json(loans);
    } catch (error) {
        console.error('Error fetching user loans:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get a list of all loans (Admin/Staff view)
router.get('/', auth, async (req, res) => {
    try {
        const loans = await Loan.findAll({ include: [Book] });
        res.json(loans);
    } catch (error) {
        console.error('Error fetching all loans:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// create a new loan (Checking out a book)
router.post('/', auth, async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user.id; 

        // Find the book to check availability
        const book = await Book.findByPk(book_id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.available_copies <= 0) {
            return res.status(400).json({ message: 'No copies available for checkout' });
        }

        // Create the loan record
        const newLoan = await Loan.create({
            book_id,
            user_id,
            loan_date: new Date(),
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day default
            status: 'active'
        });

        // Decrement the book inventory
        await book.decrement('available_copies', { by: 1 });

        res.status(201).json({ message: 'Book checked out successfully', loan: newLoan });
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// update a loan (Returning a book)
router.put('/:id', auth, async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan record not found' });
        }

        // Only update inventory if status is changing to 'returned' for the first time
        if (req.body.status === 'returned' && loan.status !== 'returned') {
            const book = await Book.findByPk(loan.book_id);
            if (book) {
                await book.increment('available_copies', { by: 1 });
            }
            req.body.return_date = new Date();
        }

        await loan.update(req.body);
        res.json({ message: 'Loan updated successfully', loan });
    } catch (error) {
        console.error('Error updating loan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// delete a loan record
router.delete('/:id', auth, async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan record not found' });
        }

        await loan.destroy();
        res.json({ message: 'Loan record deleted successfully' });
    } catch (error) {
        console.error('Error deleting loan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;