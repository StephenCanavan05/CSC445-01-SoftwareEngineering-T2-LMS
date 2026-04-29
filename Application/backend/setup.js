// This script is meant to be run once after cloning the repository to setup the development environment
// & dependancies. It will also create a .env file from the .env.example template if it doesn't already exist,
// and prompt the user to update it with their local Postgres password.
// It will instantiate the database and run the schema.sql and seed.sql scripts to create the tables
// and populate them with sample data if the database is empty.
// If the database already has tables, it will skip this step to avoid overwriting data.

// tldr; run this once after cloning, update your .env file with your local Postgres password,
// then run 'npm run dev' to start the server.

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const BACKEND_DIR = __dirname;
// Moves up one level to 'Application', then into 'database'
const DB_FOLDER = path.resolve(BACKEND_DIR, '../database');

console.log("Starting Library System Setup...");

// 1. Install Node Dependencies
try {
    console.log("Installing npm packages...");
    execSync('npm install', { cwd: BACKEND_DIR, stdio: 'inherit' });
} catch (error) {
    console.error("Error: npm install failed.");
    process.exit(1);
}

// 2. Setup the .env file
const envPath = path.join(BACKEND_DIR, '.env');
const examplePath = path.join(BACKEND_DIR, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log(".env file created from example.");
    }
}

// 3. Database Setup
console.log("Setting up PostgreSQL database...");

try {
    execSync('psql --version', { stdio: 'ignore' });

    try {
        execSync('createdb lms_db', { stdio: 'ignore' });
        console.log("Database 'lms_db' created.");
    } catch (e) {
        console.log("Database 'lms_db' already exists or user lacks permissions.");
    }

    const schemaSqlPath = path.join(DB_FOLDER, 'schema.sql');
    const seedSqlPath = path.join(DB_FOLDER, 'seed.sql');

    if (fs.existsSync(schemaSqlPath)) {
        console.log("Running schema.sql...");
        execSync(`psql -d lms_db -f "${schemaSqlPath}"`, { stdio: 'inherit' }); 
    } else {
        console.error("Error: schema.sql not found at: " + schemaSqlPath);
    }
    
    if (fs.existsSync(seedSqlPath)) {
        console.log("Running seed.sql...");
        execSync(`psql -d lms_db -f "${seedSqlPath}"`, { stdio: 'inherit' });
    } else {
        console.error("Error: seed.sql not found at: " + seedSqlPath);
    }

    console.log("Database initialized.");

} catch (error) {
    console.log("Error: Could not automate database setup. Ensure PostgreSQL is installed.");
}

console.log("\nSetup complete. Update your .env, then run 'npm run dev'.");