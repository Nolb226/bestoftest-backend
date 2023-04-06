const Class = require('../models/class');
const Exam = require('../models/exam');
const Lecture = require('../models/lecture');
const Student = require('../models/student');
const Student_Result = require('../models/student_result');
const sequelize = require('../util/database');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

exports.getLectures = async (req, res, _) => {
	try {
		const lectures = await Lecture.findAll();
		successResponse(res, 200, lectures, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getLecture = async (req, res, _) => {
	try {
		const { lectureId } = req.params;
		const lecture = await Lecture.findByPk(lectureId, {
			include: { all: true },
		});
		if (!lecture) {
			throwError(`Couldn't find lecture`, 404);
		}
		successResponse(res, 200, lecture, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getLectureChapters = async (req, res, _) => {
	try {
		const { lectureId } = req.params;
		const lecture = await Lecture.findByPk(lectureId);
		if (!lecture) {
			throwError(`Couldn't find lecture`, 404);
		}
		const chapters = await lecture.getChapters({
			attributes: ['id', 'name', 'numberOfQuestions'],
		});
		successResponse(res, 200, chapters, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getLectureStudentResults = async (req, res) => {
	try {
		const { lectureId } = req.params;
		const lecture = await Lecture.findByPk(lectureId);
		if (!lecture) {
			throwError('Could not find lecture', 404);
		}
		const result = await sequelize.query(
			`SELECT students.id,examId as exam ,fullname,grade,classId,content FROM classes JOIN  classdetail ON classes.id = classdetail.classId JOIN students ON students.id= classdetail.studentId JOIN studentresults ON studentresults.studentId= students.id WHERE classes.lectureId ="${lectureId}"`,
			{ type: sequelize.QueryTypes.SELECT }
		);
		successResponse(res, 200, result, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};
