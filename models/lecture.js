const sequelize = require('../util/database');
const DataTypes = require('sequelize').DataTypes;

const Lecture = sequelize.define('lecture', {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	credits: {
		type: DataTypes.TINYINT(1),
		allowNull: false,
	},
	totalChapters: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

module.exports = Lecture;
