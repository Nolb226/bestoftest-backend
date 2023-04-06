const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
	process.env.DB_NAME || 'qlttn',
	process.env.DB_USERNAME || 'root',
	process.env.DB_PASSWORD || '',
	{
		host: 'localhost',
		dialect: 'mysql',
		port: process.env.DB_PORT || '3306',
	}
);
module.exports = sequelize;
