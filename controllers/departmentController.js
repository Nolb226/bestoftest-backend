const { validationResult } = require('express-validator');
const Department = require('../models/department');
const Major = require('../models/major');
const Teacher = require('../models/teacher');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

module.exports.getDepartments = async function (req, res, _) {
	try {
		const Departments = await Department.findAll({
			attributes: ['id', 'name'],
		});
		successResponse(res, 200, Departments);
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.getDepartment = async function (req, res, _) {
	const { departmentId } = req.params;
	try {
		const department = await Department.findByPk(departmentId, {
			attributes: ['id', 'name', 'headOfDepartment'],
			include: [
				{ model: Major, attributes: ['id', 'name'] },
				{
					model: Teacher,
					attributes: ['id', 'fullname'],
				},
			],
		});
		if (!department) {
			throwError(`Could not find department`, 404);
		}
		successResponse(res, 200, department);
	} catch (error) {
		errorResponse(res, error);
	}
};
module.exports.getMajorsInDepartment = async function (req, res, _) {
	try {
		const { departmentId } = req.params;
		const department = await Department.findByPk(departmentId, {
			attributes: ['id', 'name', 'headOfDepartment'],
		});
		if (!department) {
			throwError('Could not find department');
		}
		const majors = await department.getMajors({ attributes: ['id', 'name'] });
		successResponse(res, 200, majors);
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.postDepartment = async function (req, res, _) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 400);
		}
		const { id: departmentId, name } = req.body;
		const department = await Department.findByPk(departmentId);
		if (department) {
			throwError(`Department with this id has been created`, 409);
		}
		await Department.create({
			id: departmentId,
			name,
		});
		successResponse(res, 201, {}, 'POST');
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.postMajorInDepartment = async function (req, res, _) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 400);
		}
		const { departmentId } = req.params;
		const { id, name } = req.body;
		const department = await Department.findByPk(departmentId);
		if (!department) {
			throwError('Could not find department', 404);
		}
		await department.addMajor(
			await Major.create({
				id,
				name,
			})
		);
		successResponse(res, 201, {}, 'POST');
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.putDepartment = async function (req, res, _) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 400);
		}
		const { departmentId } = req.params;
		const { id, name } = req.params;
		const department = await Department.findByPk(departmentId);
		if (!department) {
			throwError('Could not find department', 404);
		}
		await department.update({
			id,
			name,
		});
		successResponse(res, 200, {}, 'PUT');
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.deleteDepartment = async function () {
	const { departmentId } = req.params;

	try {
		const department = await Department.findByPk(departmentId);
		if (!department) {
			throwError('Could not find department', 404);
		}
		await department.destroy();
		successResponse(res, 200, {}, 'DELETE');
	} catch (error) {
		errorResponse(res, error);
	}
};
