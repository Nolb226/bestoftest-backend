const Major = require('../models/major');
const { successResponse } = require('../util/helper');

module.exports.getMajors = async function (req, res, _) {
	const majors = await Major.findAll({ attributes: ['id', 'name'] });
	successResponse(res, 200, majors);
};
