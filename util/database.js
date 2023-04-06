const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
	'bestoftest',
	'qlttngroup5',
	'bestoftestgroup5',
	{
		host: 'db4free.net',

		dialect: 'mysql',
		port: '3306',
	}
);
module.exports = sequelize;
