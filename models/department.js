const sequelize = require('../util/database');
const DataTypes = require('sequelize').DataTypes;

const Department = sequelize.define('department', {
	id: {
		type: DataTypes.STRING(10),
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING(50),
		allowNull: false,
	},
});

module.exports = Department;
