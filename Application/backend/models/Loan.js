const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
    loan_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    loan_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    return_date: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active' // can be 'active' or 'returned'
    }
}, {
    tableName: 'loans',
    timestamps: false
});

module.exports = Loan;