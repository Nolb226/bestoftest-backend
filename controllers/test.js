const Account = require('../models/account');
const Functions = require('../models/function');
const Permission_Group = require('../models/permission_group');
const Student = require('../models/student');
const Teacher = require('../models/teacher');

module.exports.test = async (req, res) => {
	const { account } = req;

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

	res.status(200).json(user);
};
