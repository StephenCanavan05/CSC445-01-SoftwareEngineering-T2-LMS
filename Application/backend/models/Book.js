const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    author: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING(100)
    },
    availability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'books',
    timestamps: false
});

module.exports = Book;