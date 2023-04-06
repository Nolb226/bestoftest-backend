const sequelize = require('../util/database');
const DataTypes = require('sequelize').DataTypes;

const Major = sequelize.define('major', {
	id: {
		type: DataTypes.STRING(10),
		allowNull: false,
		primaryKey: true,
		unique: true,
	},

	name: {
		type: DataTypes.STRING(50),
		allowNull: false,
	},
});

module.exports = Major;
