const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'books',
            key: 'book_id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0
        }
    },
    location: {
        type: DataTypes.STRING(100)
    }
}, {
    tableName: 'inventory',
    timestamps: false
});

module.exports = Inventory;