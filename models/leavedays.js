const Employee = require("./employee");
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => { 
    const LeaveDays = sequelize.define("leavedays", {
        Leave_Type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Number_of_Leave_Days: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Opening_Leave_Days: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Brought_Forward: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Taken_Leave_Days: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Remaining_Leave_Days: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Leave_Year: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        Carry_Forward: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
    });

    return LeaveDays;
};