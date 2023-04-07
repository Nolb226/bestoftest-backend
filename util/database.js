const Sequelize = require('sequelize');
require('dotenv').config();

let sequelize;
if (process.env.NODE_ENV !== 'test') {
	sequelize = new Sequelize(
		'mysql://qs8bzb9tli4g3ip6:t562arn3ylweb754@grp6m5lz95d9exiz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/dy0jhdljqz4f0tqo',
		{
			dialect: 'mysql',
		}
	);
} else {
	sequelize = new Sequelize('hoang', 'root', '', {
		host: 'localhost',
		dialect: 'mysql',
		port: '3307',
	});
}
// const sequelize = new Sequelize(
// 	process.env.DB_NAME || 'bestoftest',
// 	process.env.DB_USERNAME || 'qlttngroup5',
// 	process.env.DB_PASSWORD || 'bestoftestgroup5',
// 	{
// 		host: process.env.DB_HOST || 'db4free.net',

// 		dialect: 'mysql',
// 		port: process.env.DB_PORT || '3306',
// 	}
// );
module.exports = sequelize;
