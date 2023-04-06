const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

module.exports.checkPermission = async function (req, res, next) {
	try {
		const path = this.path || req.baseUrl.split('/')[1];
		const { permissions } = req;
		console.log(path);
		console.log(permissions);
		if (permissions.includes(`"method":"${req.method}","path":"${path}"`)) {
			return next();
		}
		req.permissions = permissions;
		return throwError('Forbidden Request', 403);
	} catch (error) {
		console.log(error);
		return errorResponse(res, error, {});
	}
};
