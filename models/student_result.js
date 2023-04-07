const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');
const Student = require('./student');
const Exam = require('./exam');

const Student_Result = sequelize.define('studentresult', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	studentId: {
		type: DataTypes.STRING(10),
		references: {
			model: Student,
			key: 'id',
		},
	},
	examId: {
		type: DataTypes.STRING(10),
		references: {
			model: Exam,
			key: 'id',
		},
	},
	grade: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
	// isLock: {
	// 	type: DataTypes.BOOLEAN,
	// 	defaultValue: false,
	// },
	content: {
		type: DataTypes.JSON,
		allowNull: false,
	},
	isDone: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
});

module.exports = Student_Result;
