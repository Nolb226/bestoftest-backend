const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const Exam_Result = sequelize.define('examresult', {});

module.exports = Exam_Result;
