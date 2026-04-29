const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// load env variables
dotenv.config();

// init express app
const app = express();

// middleware
app.use(cors()); // allow cors requests
app.use(express.json()); // parse json payloads

// db connection setup
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

// db automation function
const initializeDatabase = async () => {
    try {
        // check if users table exists
        const [results] = await sequelize.query(
            "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'users');"
        );
        
        const tableExists = results[0].exists;

        if (!tableExists) {
            console.log('database empty. building tables from schema...');
            
            // read sql files from the sibling database folder
            const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
            const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
            
            // run schema then seed
            await sequelize.query(schemaSql);
            console.log('schema built successfully.');
            
            await sequelize.query(seedSql);
            console.log('sample data seeded successfully.');
        } else {
            console.log('database tables found. skipping setup.');
        }
    } catch (error) {
        console.error('database initialization failed:', error);
    }
};

// test db connection and run init
sequelize.authenticate()
    .then(() => {
        console.log('database connection established.');
        return initializeDatabase();
    })
    .catch((error) => {
        console.error('unable to connect to the database:', error);
    });

// routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'LMS API is running and connected' 
    });
});

// placeholder controller routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
// app.use('/api/circulation', require('./routes/circulationRoutes'));

// start the server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});