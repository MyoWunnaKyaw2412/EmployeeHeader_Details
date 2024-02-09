const LeaveDays = require("./leavedays");
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Employee = sequelize.define("employees", {
        Employee_Id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        Name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Father_Name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        DOB: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Gender: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        NRC_Exists: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        NRC: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });
    return Employee;
};