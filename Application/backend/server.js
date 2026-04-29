const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// load env variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// import database config
const sequelize = require('./config/database');

// init express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database connection and model sync
sequelize.authenticate()
    .then(() => {
        console.log('Database connection established.');
        return sequelize.sync({ force: false });
    })
    .then(() => {
        console.log('Database models synchronized.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

// health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'LMS API is running and connected' 
    });
});

// routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});