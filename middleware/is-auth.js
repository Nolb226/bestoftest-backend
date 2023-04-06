const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const Functions = require('../models/function');
const Permission_Group = require('../models/permission_group');
const Student = require('../models/student');
const { throwError, errorResponse } = require('../util/helper');
module.exports.isAuth = async (req, res, next) => {
	try {
		// const token = req.get('Authorization').split(' ')[1];
		// if (!token) {
		// 	throwError('Invalid authorization', 401);
		// }
		// const decodedToken = jwt.verify(token, 'group5');
		// const { id: accountId } = decodedToken;
		const user = await Account.findByPk(1, {
			include: [
				{
					model: Permission_Group,
					as: 'permissions',
					attributes: ['name'],
					through: {
						attributes: [],
					},
					include: [
						{
							model: Functions,
							attributes: ['id', 'method', 'path'],
							through: {
								attributes: [],
							},
						},
					],
				},
			],
			attributes: ['id', 'password', 'type', 'isActive'],

			required: false,
		});
		if (!user) {
			throwError('Invalid account id in token', 401);
		}
		const a = {
			b: '123',
		};
		a.c = '123';
		// req.user = JSON.stringify(user);
		req.account = user;
		req.permissions = JSON.stringify(user.permissions);
		next();
	} catch (error) {
		errorResponse(res, error);
	}
};
