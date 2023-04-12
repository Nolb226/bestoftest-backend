'use strict';
const { validationResult } = require('express-validator');
// const Excel = require('exceljs');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const Classes = require('../models/class');
const classDetails = require('../models/classdetail');

//helper
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

const Teacher = require('../models/teacher');
const Lecture = require('../models/lecture');
const Student_Result = require('../models/student_result');
const Exam = require('../models/exam');
const Class = require('../models/class');
const e = require('express');
const sequelize = require('../util/database');
const { Op } = require('sequelize');
const Student = require('../models/student');
const deleteExcel = function (filePath) {
	const file = path.join(__dirname, '..', filePath);
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
				{ model: Teacher, attributes: ['id', 'fullname'] },
				{ model: Lecture, attributes: ['id', 'name'] },
			],
			attributes: ['id', 'name', 'isLock'],
			offset: pageSize * (page - 1),
			limit: pageSize,
		});
		const total = await classDetails.count({ where: { studentId: user.id } });

		return successResponse(res, 200, { data: classes, total });
	} catch (error) {
		errorResponse(res, error, [{}]);
	}
};

exports.getClass = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const foundedClass = await Classes.findByPk(classId, {
			include: [
				{ model: Teacher, attributes: ['id', 'fullname'] },
				{ model: Lecture, attributes: ['id', 'name', 'credits'] },
			],
			attributes: ['year', 'id', 'name', 'semester'],
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

exports.getClassEdit = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const foundedClass = await Classes.findByPk(classId, {
			attributes: ['id', 'name', 'semester', 'password'],
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
		const page = req.query.page || 1;
		const perPage = 10;
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
		if (!classDetail) {
			throwError(`Could not find class`, 404);
		}
		const students = await classDetail.getStudents({
			attributes: ['id', 'dob', 'fullname', 'majorId'],
			include: [
				{
					model: Student_Result,
					attributes: ['grade'],
				},
			],
			joinTableAttributes: [],
			// raw: true,
			// nest: true,
			offset: (page - 1) * perPage,
			limit: perPage,
		});
		const total = await classDetails.count({ where: { classId } });

		const data = { data: students, total };
		// data.totals = totals;
		return successResponse(res, 200, data);
	} catch (error) {
		errorResponse(res, error, []);
	}
};

exports.getStudentInClass = async (req, res, _) => {
	try {
		const { classId, studentId } = req.params;
		const classroom = await Classes.findByPk(classId);
		if (!classroom) {
			throwError(`Couldn't find classroom`, 404);
		}

		const studentsInClass = await classroom.getStudents({
			where: { id: studentId },
			joinTableAttributes: [],
		});
		if (!studentsInClass[0]) {
			throwError(`Couldn't find student`, 404);
		}
		successResponse(res, 200, studentsInClass[0]);

		// successResponse(res, 200, { id, fullname, dob, majorId });
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassesExams = async (req, res, _) => {
	const { user } = req;

	try {
		// const exams = await user.getClasses({
		// 	include: [{ model: Exam }, { model: Lecture, attributes: ['name'] }],
		// 	attributes: ['name'],
		// 	joinTableAttributes: [],
		// 	// raw: true,
		// 	nest: true,
		// });
		const page = req.query.page || 1;
		const perPage = 10;
		const exams = await sequelize.query(
			`
			SELECT   	classes.id as class_id,
						lectures.name as lecture_name,
						exams.name,
						exams.id,
						classes.isLock

			FROM      	classes 
			JOIN		exams 
			ON 			classes.id = exams.classId 
			JOIN      	lectures 
			ON 			classes.lectureId = lectures.id 
			WHERE 		classes.teacherId = "10991" 
			LIMIT 		${perPage}
			OFFSET 		${perPage * (page - 1)}
		`,
			{
				type: sequelize.QueryTypes.SELECT,
			}
		);
		const result = await Promise.all(
			exams.map(async (exam) => {
				const totals = await Student_Result.count({
					where: { [Op.and]: [{ examId: exam.id }, { isDone: true }] },
				});
				return { ...exam, totals };
			})
		);

		successResponse(res, 200, result);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassExams = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const { user } = req;
		const foundedClass = await Classes.findByPk(classId);

		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		const exams = await foundedClass.getExams({
			include: [
				{
					model: Student_Result,
					where: { studentId: user.id },
					attributes: ['isDone'],
				},
			],
			attributes: ['name', 'id', 'duration', 'totalQuestions'],
			// raw: true,
			// nest: false,
		});

		successResponse(res, 200, exams);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getClassExamsResult = async (req, res, _) => {
	try {
		const { classId } = req.params;
		// const studentresults = await sequelize.query(
		// 	`
		// 	SELECT * FROM classes JOIN classdetail ON classes.id = classdetail.classId JOIN students ON students.id = classdetail.studentId JOIN studentresults ON studentresults.studentId = students.id JOIN exams ON exams.id = studentresults.examId WHERE classes.id ="${classId}" GROUP BY students.id
		// `,
		// 	{ type: sequelize.QueryTypes.SELECT }
		// );
		// const results = await Promise.all(
		// 	studentresults.map(async (result) => {
		// 		const exams = await Student_Result.findAll({
		// 			where: { studentId: result.studentId },
		// 		});
		// 		console.log(exams);
		// 		return { ...result, exams };
		// 	})
		// );

		const classroom = await Class.findByPk(classId);
		if (!classroom) {
			throwError(`Could not find class`, 404);
		}
		const studentresults = await classroom.getStudents({
			include: [
				{
					model: Exam,
					attributes: ['id', 'name'],
					through: {
						attributes: ['grade', 'content'],
					},
				},
			],
			attributes: ['dob', 'id', 'fullname'],
			joinTableAttributes: [],
		});

		successResponse(res, 200, studentresults);
	} catch (error) {
		console.log(error);
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

		// const studentresults = await sequelize.query(
		// 	`
		// 	SELECT * FROM classes JOIN classdetail ON classes.id = classdetail.classId JOIN students ON students.id = classdetail.studentId JOIN studentresults ON studentresults.studentId = students.id JOIN exams ON exams.id = studentresults.examId WHERE exams.id ="${examId}" AND classes.id ="${classId}" GROUP BY exams.id
		// `,
		// 	{ type: sequelize.QueryTypes.SELECT }
		// );
		successResponse(res, 200, studentresults);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.postClass = async (req, res, _) => {
	let file = req.file;
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 400);
		}
		const { user } = req;
		const { id, name, password, year, semester, lectureId, accountpassword } =
			req.body;
		const newClass = await Class.create({
			name,
			password,
			semester,
			year,
			lectureId,
		});

		await user.addClass(newClass);

		if ((file = req.file)) {
			const filePath = await file.path;
			const extname = /xls/.test(path.extname(file.originalname).toLowerCase());

			let data;
			if (extname) {
				const workbook = new Excel.Workbook();
				await workbook.xlsx.readFile(filePath);
				const worksheet = workbook.getWorksheet('Sheet1');
				console.log(workbook + '1');
			} else {
				const workbook = XLSX.readFile(
					// path.join(__dirname, '..', 'excels/Book1.xlsx')
					filePath
				);
				data = XLSX.utils.sheet_to_json(
					workbook.Sheets[workbook.SheetNames[0]]
				);
			}
			console.log(data);
			data.forEach(async (student, number) => {
				const cuttedDOB = student['ngày sinh']?.split('/') || new Date();
				const year = cuttedDOB[2];
				const month = cuttedDOB[1];
				const day = cuttedDOB[0];
				console.log(student['Mã lớp'].slice(0, 3));
				await newClass.createClassStudent({
					accountpassword,
					id: student['MSSV'] || student['Mã sinh viên'],
					dob: new Date(year, month, day),
					fullname:
						student['Họ tên'] || student['Họ lót'] + ' ' + student['Tên'],
					majorId: student['chuyên ngành'] || student['Mã lớp'].slice(0, 3),
				});
			});
			const newTotal = await classDetails.count({
				where: { classId: newClass.id },
			});
			await newClass.update({
				totalStudent: newTotal,
			});
			deleteExcel(filePath);
		}

		successResponse(res, 201, {}, req.method);
	} catch (error) {
		deleteExcel(file.path);

		errorResponse(res, error);
	}
};

exports.postClassExam = async (req, res) => {
	try {
		const { classId } = req.params;
		const classroom = await Class.findByPk(classId);
		const {
			type,
			id,
			name,
			timeStart,
			timeEnd,
			duration,
			totalQuestions,
			ratioQuestions,
		} = req.body;
		const exam = await classroom.createExam({
			type,
			id,
			name,
			timeStart,
			timeEnd,
			duration,
			ratioQuestions,
			totalQuestions,
		});
		const students = await classroom.getStudents();
		if (type === 0) {
		}
		if (type === 1) {
			const content = await sequelize.query(
				`
				SELECT 		questions.id,
							description,
							correctAns,
							answerA,
							answerB,
							answerC,
							answerD 

				FROM 		exams 
				JOIN 		classes 
				ON 			exams.classId 		= classes.id 
				JOIN 		lectures 
				ON 			classes.lectureId	= lectures.id 
				JOIN 		Chapters 
				ON 			lectures.Id			= chapters.lectureId 
				JOIN 		questions 
				ON 			questions.chapterId	= chapters.id 
				WHERE 		chapterId 			= "WEBC1" 
				AND NOT 	questions.status	= "2"
				ORDER BY 	Rand() 
				LIMIT 		10;`,
				{ type: sequelize.QueryTypes.SELECT }
			);
			const result = await Promise.all(
				students.map(async (student) => {
					return await student.addExam(exam, {
						through: { content },
					});
				})
			);

			successResponse(res, 200, result);
			return;
		}
		if (type === 2) {
			const result = await Promise.all(
				students.map(async (student) => {
					const content = await sequelize.query(
						`
						SELECT 		questions.id,
									description,
									correctAns,
									answerA,
									answerB,
									answerC,
									answerD 

						FROM 		exams 
						JOIN 		classes 
						ON 			exams.classId 		= classes.id 
						JOIN 		lectures 
						ON 			classes.lectureId	= lectures.id 
						JOIN 		Chapters 
						ON 			lectures.Id			= chapters.lectureId 
						JOIN 		questions 
						ON 			questions.chapterId	= chapters.id 
						WHERE 		chapterId 			= "WEBC1" 
						AND NOT 	questions.status	= "2"
						ORDER BY 	Rand() 
						LIMIT 		10;`,
						{ type: sequelize.QueryTypes.SELECT }
					);
					console.log(content);
					return await student.addExam(exam, {
						through: { content },
					});
				})
			);

			successResponse(res, 200, result);
			return;
		}
	} catch (error) {
		console.log(error);
		errorResponse(res, error);
	}
};

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
	try {
		const { classId, studentId } = req.params;
		const foundedClass = await Classes.findByPk(classId);
		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		const student = await foundedClass.getStudents({
			where: {
				id: studentId,
			},
		});

		await student[0].update({});
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.patchClassIsLock = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const { isLock } = req.body;
		console.log(req.body);
		const foundedClass = await Classes.findByPk(classId, {
			include: [
				{
					model: Lecture,
					attributes: ['name'],
				},
			],
			attributes: ['id', 'name', 'isLock'],
		});
		if (!foundedClass) {
			throwError(`Could not find class`, 404);
		}
		await foundedClass.update({
			isLock,
		});
		successResponse(res, 200, foundedClass, req.method);
	} catch (error) {
		console.log(error);
		errorResponse(res, error);
	}
};

exports.patchExamIsLock = async (req, res, _) => {
	try {
		const { classId, examId } = req.params;
		const { isLock } = req.body;
		const classroom = await Class.findByPk(classId);
		if (!classroom) {
			throwError('Classroom not found', 404);
		}
		const exam = await classroom.getExams({ where: { id: examId } });
		if (!exam[0]) {
			throwError('Exam not found', 404);
		}
		exam[0].isLock = isLock;
		await exam[0].save();
		successResponse(res, 200);
	} catch (error) {
		errorResponse(res, error);
	}
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

exports.deleteClassStudent = async (req, res, _) => {
	try {
		const { classId } = req.params;
		const classroom = await Class.findByPk(classId);
		if (!classroom) {
			throwError(`Could not find class`, 404);
		}
		const { studentId } = req.params;
		const student = await classroom.getStudents({
			where: { id: studentId },
		});
		await classroom.removeStudent(student[0]);
		successResponse(res, 200, _, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};
