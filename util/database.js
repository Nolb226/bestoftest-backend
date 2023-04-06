const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
	process.env.DB_NAME || 'bestoftest',
	process.env.DB_USERNAME || 'qlttngroup5',
	process.env.DB_PASSWORD || 'bestoftestgroup5',
	{
		host: 'db4free.net',

		dialect: 'mysql',
		port: process.env.DB_PORT || '3306',
	}
);
module.exports = sequelize;
