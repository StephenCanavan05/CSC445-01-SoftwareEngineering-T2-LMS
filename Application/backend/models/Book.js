const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// define what a book looks like based on jack's sql schema
const Book = sequelize.define('Book', {
    book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING
    },
    availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'books',
    timestamps: false   // no created_at/updated_at columns
});

module.exports = Book;