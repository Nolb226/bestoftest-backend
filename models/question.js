const sequelize = require('../util/database');
const { DataTypes } = require('sequelize');

const Question = sequelize.define(
	'question',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
			primaryKey: true,
			autoIncrement: true,
		},

		correctAns: {
			type: DataTypes.STRING(1),
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		answerA: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		answerB: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		answerC: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		answerD: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		difficulty: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue: 0, //0: normal , 1: edited , 2: deleted
			allowNull: false,
		},
	},
	{
		paranoid: true,
	}
);

Question.addHook('beforeCreate', async function (question) {});

module.exports = Question;
