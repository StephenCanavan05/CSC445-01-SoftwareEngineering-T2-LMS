const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// define the loan model
const Loan = sequelize.define('Loan', {
    loan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    borrow_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    due_date: { type: DataTypes.DATE, allowNull: false },
    return_date: { type: DataTypes.DATE }
}, {
    tableName: 'loans',
    timestamps: false
});

module.exports = Loan;