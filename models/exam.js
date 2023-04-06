const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const Exam = sequelize.define('exam', {
	id: {
		type: DataTypes.STRING(10),
		allowNull: false,
		unique: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING(50),
		allowNull: false,
	},
	timeStart: {
		type: DataTypes.DATE,
	},
	timeEnd: {
		type: DataTypes.DATE,
	},
	duration: {
		type: DataTypes.INTEGER,
	},
	totalQuestions: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	ratioQuestions: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	type: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	isLock: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
});

module.exports = Exam;
