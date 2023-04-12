const Sequelize = require('sequelize');
require('dotenv').config();

let sequelize;
const node_env = process.env.NODE_ENV;
console.log(node_env);

if (node_env === 'production') {
	sequelize = new Sequelize(
		'mysql://buo405oid9oh1vm7:xld5vkfrblrm5na2@l0ebsc9jituxzmts.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/aq2zsr3yc0jybqe4',
		{
			dialect: 'mysql',
			migrate: 'safe',
		}
	);
	console.log(node_env);
} else if (node_env === 'test ') {
	sequelize = new Sequelize('hoang', 'root', '', {
		host: 'localhost',
		dialect: 'mysql',
		port: '3306',
	});
	console.log(node_env, sequelize);
} else {
	throw new Error(`Invalid NODE_ENV value: ${node_env}`);
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
