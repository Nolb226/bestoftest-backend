const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const Exam_Result = sequelize.define('examResult', {});

module.exports = Exam_Result;
