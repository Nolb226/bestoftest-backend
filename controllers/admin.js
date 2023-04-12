const Account = require('../models/account');
const Class = require('../models/class');
const Exam = require('../models/exam');
const Permission_Group = require('../models/permission_group');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const sequelize = require('../util/database');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

exports.getAllAccounts = async (req, res, _) => {
	try {
		const page = req.query.page || 1;
		const perPage = 10;
		const accounts = await Account.findAll({
			limit: perPage,
			offset: (page - 1) * perPage,
			include: [
				{
					model: Student,
					attributes: ['id', 'fullname'],
				},
				{ model: Teacher, attributes: ['id', 'fullname'] },
			],
			attributes: ['id', 'type', 'isActive'],
		});
		successResponse(res, 200, accounts, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getAccount = async (req, res, _) => {
	try {
		const { accountId } = req.params;
		const { type } = req.query;
		let account;
		if (type === 'SV') {
			account = await sequelize.query(
				`SELECT 	students.id as id,students.fullname,students.dob,departments.name as department_name,departments.id as department_id,accounts.createdAt,majors.name as major_name,majors.id as major_id,accounts.type,accounts.isActive 
				 FROM 		departments JOIN majors 
				 ON 		departments.id 		= majors.departmentId 
				 JOIN		students 
				 ON 		students.majorId 	= majors.id 
				 JOIN 		accounts 
				 ON 		students.accountId	= accounts.id 
				 WHERE		accounts.id = "${accountId}"`,
				{ type: sequelize.QueryTypes.SELECT }
			);
		}
		if (type === 'GV') {
			account = await sequelize.query(
				`
				SELECT 		teachers.id as id,teachers.fullname,teachers.dob,departments.name as department_name,departments.id as department_id,accounts.createdAt,majors.name as major_name,majors.id as major_id,accounts.type,accounts.isActive  
				FROM 		departments JOIN majors 
				ON 			departments.id 			= majors.departmentId 
				JOIN 		teachers 
				ON 			teachers.departmentId 	= departments.id 
				JOIN		accounts 
				ON 			teachers.accountId 		= accounts.id 
				WHERE 		accounts.id = "${accountId}"`,
				{ type: sequelize.QueryTypes.SELECT }
			);
		}

		if (!account[0]) {
			throwError(`Could not find account`, 404);
		}
		successResponse(res, 200, account[0], req.method);
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

exports.getAllExams = async (req, res, _) => {
	try {
		const exams = await Exam.findAll();
		successResponse(res, 200, exams, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};
