'use strict';
const { validationResult } = require('express-validator');
// const Excel = require('exceljs');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const Classes = require('../models/class');
const classDetails = require('../models/classdetail');
const Student = require('../models/student');

//helper
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');
const dayjs = require('dayjs');
const { log } = require('console');
const Account = require('../models/account');
const sequelize = require('../util/database');
const Major = require('../models/major');
const Department = require('../models/department');
const Teacher = require('../models/teacher');
const Lecture = require('../models/lecture');
const Student_Result = require('../models/student_result');
const Exam = require('../models/exam');
const deleteExcel = function (filePath) {
	const file = path.join(__dirname, '..', filePath);
	console.log(file);
	fs.unlink(file, (err) => console.log(err));
};

exports.getClasses = async (req, res, _) => {
	try {
		const page = req.query.page || 1;
		const pageSize = 10;

		const { user, account } = req;
		if (!account.isActive) {
			return successResponse(res, 200, {}, 'GET');
		}

		const classes = await user.getClasses({
			include: [
				{ model: Teacher, attributes: ['id', 'fullname', 'departmentId'] },
				{ model: Lecture, attributes: ['id', 'name', 'credits'] },
			],
			offset: pageSize * (page - 1),
			limit: pageSize,
		});

		return successResponse(res, 200, classes);
	} catch (error) {
		errorResponse(res, error, [{}]);
	}
};

exports.getClass = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const foundedClass = await Classes.findByPk(classId, {
			include: [
				{ model: Teacher, attributes: ['id', 'fullname', 'departmentId'] },
				{ model: Lecture, attributes: ['id', 'name', 'credits'] },
			],
		});
		// console.log(foundedClass);
		if (!foundedClass) {
			return throwError('Class not found', 404);
		}
		return successResponse(res, 200, foundedClass);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getAllStudent = async (req, res, _) => {
	try {
		// console.log(req.path);
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const messages = errors
				.array()
				.map((err) => err.msg)
				.join(',');
			throwError(messages, 400);
		}
		const { classId } = req.params;

		const classDetail = await Classes.findByPk(classId);
		const students = await classDetail.getStudents({
			attributes: [
				'id',
				'dob',
				'fullname',
				'majorId',
				// [sequelize.literal('Account.isActive'), 'isActive'],
				// [sequelize.literal('Account.type'), 'type'],
			],
			include: [
				{
					model: Account,
					// attributes: [],
					attributes: ['isActive', 'type'],
				},
				// {
				// 	model: Major,
				// 	attributes: ['id', 'name'],
				// 	include: [
				// 		{
				// 			model: Department,
				// 			attributes: ['id', 'name'],
				// 		},
				// 	],
				// },
			],
			through: {
				attributes: [],
			},
		});

		return successResponse(res, 200, students);
	} catch (error) {
		errorResponse(res, error, []);
	}
};

exports.getStudentInClass = async (req, res, _) => {
	try {
		const { classId, studentId } = req.params;
		const classroom = await Classes.findByPk(classId);
		if (!classroom) {
		}

		const studentsInClass = await classroom.getStudents({
			where: { id: studentId },
		});
		successResponse(res, 200, { student: studentsInClass });

		// successResponse(res, 200, { id, fullname, dob, majorId });
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassesExams = async (req, res, _) => {
	const { user } = req;

	try {
		const exams = await user.getClasses({
			include: [{ model: Exam }, { model: Lecture, attributes: ['name'] }],
			attributes: ['name'],
			through: [],
			// raw: true,
			nest: true,
		});
		successResponse(res, 200, exams);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassExams = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const { user } = req;
		// const foundedClass = await Classes.findByPk(classId);
		const foundedClass = await user.getClasses({
			where: { id: classId },
			include: [
				{
					model: Lecture,
				},
			],
		});

		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		const exams = await foundedClass[0].getExams({
			include: [
				{
					model: Student_Result,
					where: { studentId: user.id },
					attributes: ['isDone'],
				},
			],
			attributes: ['name', 'id', 'duration', 'totalQuestions'],
			raw: true,
			nest: false,
		});

		successResponse(res, 200, { foundedClass, exams });
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassExam = async (req, res, _) => {
	try {
		const { classId, examId } = req.params;
		const foundedClass = await Classes.findByPk(classId);
		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		const exams = await foundedClass.getExams({
			where: { id: examId },
			attributes: [
				'id',
				'name',
				'timeStart',
				'timeEnd',
				'duration',
				'totalQuestions',
				'ratioQuestions',
				'type',
				'isLock',
			],
			// include: [
			// 	{
			// 		model: Student,
			// 		attributes: ['id', 'fullname'],
			// 		through: { attributes: ['grade'] },
			// 	},
			// ],
		});
		if (!exams[0]) {
			throwError('Could not find exam', 404);
		}
		successResponse(res, 200, exams[0]);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassExamStudentResults = async (req, res, _) => {
	try {
		const { classId, examId } = req.params;
		const foundedClass = await Classes.findByPk(classId);
		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		const exam = await foundedClass.getExams({ where: { id: examId } });
		if (!exam) {
			throwError(`Could not find exam`, 404);
		}
		const studentresults = await exam[0].getStudents({
			attributes: ['id', 'fullname'],
			// through: { attributes: ['grade'] },
		});
		successResponse(res, 200, studentresults);
	} catch (error) {
		errorResponse(res, error);
	}
};

// exports.getStudentResultInExcel = async (req, res, next) => {
// 	try {
// 		const worksheet = XLSX.
// 	} catch (error) {

// 	}
// }

exports.postClass = async (req, res, _) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 400);
		}
		const { user } = req;
		const { id, name, password, year, semester, lectureId } = req.body;
		await user.addClass(
			await Classes.create({
				name,
				password,
				semester,
				year,
				lectureId,
			})
		);

		successResponse(res, 201, {}, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.postClassExam = async (req, res) => {};

exports.postClassStudent = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const { password } = req.body;

		const foundedClass = await Classes.findByPk(classId);
		if (!foundedClass) {
			throwError(`Could not find class`, 404);
			0;
		}
		const isValid = password === foundedClass.password;
		if (!isValid || foundedClass.isLock) {
			throwError(`Could not join class`, 409);
		}
		await foundedClass.addStudent(req.user);

		const newTotal = await classDetails.count({
			where: { classId: foundedClass.id },
		});
		foundedClass.totalStudent = newTotal;
		await foundedClass.save();
		successResponse(res, 201, req.user, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.putClass = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const classFounded = await Classes.findByPk(classId);

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 409);
		}

		const { name, password, semester, year, isLock, lectureId } = req.body;
		if (!classFounded) {
			throwError('Class not found', 404);
		}
		await classFounded.update({
			name,
			password: await bcrypt.hash(password, 10),
			semester,
			year,
			isLock,
			lectureId,
		});

		successResponse(res, 201, classFounded, 'PUT');
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.putClassStudent = async (req, res, _) => {
	// try {
	// 	const { classId } = req.params;
	// 	const classIsFound = await Classes.findByPk(classId);
	// 	if (!classIsFound) {
	// 		throwError('Class not found', 404);
	// 	}
	// 	const file = req.file;
	// 	const filePath = file.path;
	// 	const workbook = XLSX.readFile(
	// 		path.join(__dirname, '..', 'excels/Book1.xlsx')
	// 		// filePath
	// 	);
	// 	let worksheet = {};
	// 	worksheet['Sheet1'] = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1']);
	// 	const data = worksheet.Sheet1;
	// 	data.forEach(async (student, number) => {
	// 		const cuttedDOB = student['ngày sinh'].split('/');
	// 		const year = cuttedDOB[2];
	// 		const month = cuttedDOB[1];
	// 		const day = cuttedDOB[0];
	// 		await classIsFound.createClassStudent({
	// 			id: student['MSSV'],
	// 			dob: new Date(year, month, day),
	// 			fullname: student['Tên'] || student['Họ tên'],
	// 			foreignKey: student['chuyên ngành'],
	// 		});
	// 	});
	// 	successResponse(res, 200, data);
	// } catch (error) {
	// 	errorResponse(res, error, [{}]);
	// }
};

exports.deleteClass = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const classFounded = await Classes.findByPk(classId);
		if (!classFounded) {
			throwError('Class not found', 404);
		}
		await classFounded.destroyClass();
		successResponse(res, 200, {}, 'DELETE');
	} catch (error) {
		errorResponse(res, error);
	}
};
