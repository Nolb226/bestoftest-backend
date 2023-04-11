const Account = require('../models/account');
const Class = require('../models/class');
const Permission_Group = require('../models/permission_group');
const { successResponse, errorResponse } = require('../util/helper');

exports.getAllAccounts = async (req, res, _) => {
	try {
		const page = req.query.page || 1;
		const perPage = 10;
		const accounts = await Account.findAll({
			limit: perPage,
			offset: (page - 1) * perPage,
			include: { all: true },
		});
		successResponse(res, 200, accounts, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getAllClasses = async (req, res, _) => {
	try {
		const page = req.query.page || 1;
		const perPage = 10;
		const classes = await Class.findAll({
			limit: perPage,
			offset: (page - 1) * perPage,
			include: { all: true },
		});
		successResponse(res, 200, classes, req.method);
	} catch (error) {}
};
exports.getAllPermissions = async (req, res, _) => {
	try {
		const permissions = await Permission_Group.findAll();
		successResponse(res, 200, permissions, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};
