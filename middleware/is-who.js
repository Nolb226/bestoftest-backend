const Account = require('../models/account');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const { errorResponse } = require('../util/helper');

module.exports.isWho = async (req, res, next) => {
	try {
		const { account } = req;
		if (account.type === 'GV') {
			req.user = await Teacher.findOne({
				attributes: ['dob', 'id', 'fullname', 'departmentId'],
				include: {
					model: Account,
					where: { id: account.id },
					attributes: ['isActive', 'type'],
				},
			});
			return next();
		}
		if (account.type === 'SV') {
			req.user = await Student.findOne({
				attributes: ['dob', 'id', 'fullname', 'majorId'],

				include: {
					model: Account,
					where: { id: account.id },
					attributes: ['isActive', 'type'],
				},
			});
			return next();
		}
	} catch (error) {
		errorResponse(res, error);
	}
};
