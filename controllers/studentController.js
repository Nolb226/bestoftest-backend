const Student = require('../models/student');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

module.exports.getStudents = async (req, res) => {
	try {
		const classObj = req.class;
		const students = await classObj.getStudents();
		successResponse(res, 200, students);
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.getStudent = async (req, res) => {
	try {
		const classObj = req.class;
		const { studentId } = req.params;
		const student = await Student.findByPk(studentId);
		if (!student) {
			return throwError('Student not found', 404);
		}
		const students = await classObj.getStudents({ where: { id: studentId } });
		if (!students.length) {
			return throwError('Student not found', 404);
		}
		return successResponse(res, 200, students);
	} catch (error) {
		errorResponse(res, error, [{}]);
	}
};



