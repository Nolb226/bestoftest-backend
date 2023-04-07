const { successResponse, errorResponse } = require('../util/helper');

exports.getUserAccount = async (req, res, _) => {
	try {
		const { user, account } = req;

		const result = { ...user, account: { ...account.dataValues } };
		console.log(result);
		successResponse(res, 200, { user, account, result });
	} catch (error) {
		errorResponse(res, error);
	}
};
