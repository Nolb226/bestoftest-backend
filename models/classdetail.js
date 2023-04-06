const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const Class = require('./class');
const Student = require('./student');

const classDetails = sequelize.define(
	'classdetail',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true,
		},
		studentId: {
			type: DataTypes.STRING(10),
			references: {
				model: Student,
				key: 'id',
			},
			allowNull: false,
		},
		classId: {
			type: DataTypes.STRING(10),
			references: {
				model: Class,
				key: 'id',
			},
			allowNull: false,
		},
	},

	{ freezeTableName: true, timestamps: false }
);

module.exports = classDetails;
