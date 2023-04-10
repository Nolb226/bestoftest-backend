const classController = require('../controllers/classController');

const router = require('express').Router();
const multer = require('multer');
const { body } = require('express-validator');
const { isAuth } = require('../middleware/is-auth');
const { checkPermission } = require('../middleware/check-permission');
const { isWho } = require('../middleware/is-who');
const studentRoutes = require('./student');
const Class = require('../models/class');
const { errorResponse, throwError } = require('../util/helper');
const Lecture = require('../models/lecture');
//METHOD : GET
router.use(isAuth, isWho);

const passingClass = async (req, res, next) => {
	try {
		const { classId } = req.params;
		const isExist = await Class.findByPk(classId);
		if (!isExist) {
			return throwError('Class not found', 404);
		}
		// console.log(req);
		const { permissions } = req;

		req.permissions = permissions;
		req.class = isExist;
		next();
	} catch (error) {
		errorResponse(res, error);
	}
};
/*
*admin&teacher
GET /classes/
get all classes 
*/
router.get(
	'/',
	// checkPermission,
	classController.getClasses
);

router.get('/exams', classController.getClassesExams);

/* 
*admin&teacher
GET /classes/{classId}
get specific class 
*/
router.get(
	'/:classId',
	// checkPermission.bind({ path: 'class' }),
	classController.getClass
);

/* 
*teacher
GET /classes/{classId}/students
get all students from the current class 
*/
router.get(
	'/:classId/students',
	// checkPermission,
	classController.getAllStudent
);

/* 
*teacher
GET /classes/{classId}/student/{studentId}
get specific students from the current class 
*/
router.get('/:classId/students/:studentId', classController.getStudentInClass);
// router.use('/:classId/students', checkPermission, passingClass, studentRoutes);

router.get('/:classId/exams', classController.getClassExams);
router.get('/:classId/exams/:examId', classController.getClassExam);
router.get(
	'/:classId/exams/:examId/results',
	classController.getClassExamStudentResults
);

//METHOD : POST

router.post(
	'/',
	[
		body('name').notEmpty().trim(),
		body('password').notEmpty().trim(),
		body('semester')
			.trim()
			.notEmpty()
			.isInt()
			.withMessage('must be a number')
			.isIn([1, 2, 3])
			.withMessage('value is not correct '),
		body('year')
			.trim()
			.notEmpty()
			.isISO8601()
			.withMessage('must be in ISO8601 format')
			.isDate()
			.withMessage('invalid day received'),
		// .withMessage('must be a date'),
		body('isLock').notEmpty().trim().isIn([true, false]),
		body('lectureId')
			.trim()
			.notEmpty()
			.custom(async (value) => {
				try {
					const lecture = await Lecture.findByPk(value);
					if (!lecture) {
						throw new Error(`Could not find Lecture`);
					}
				} catch (error) {
					throw new Error(`Could not find Lecture`);
				}
			}),
	],
	classController.postClass
);

router.post('/:classId/students', classController.postClassStudent);

router.post('/:classId/exams', [body()]);

router.post('/:classId/exams/students/:studentsId');

router.put(
	'/:classId',
	[
		body('name').notEmpty().trim(),
		body('password').notEmpty().trim(),
		body('semester')
			.trim()
			.notEmpty()
			.isInt()
			.withMessage('must be a number')
			.isIn([1, 2, 3])
			.withMessage('value is not correct '),
		body('year')
			.trim()
			.notEmpty()
			.isISO8601()
			.withMessage('must be in ISO8601 format')
			.isDate()
			.withMessage('invalid day received'),
		// .withMessage('must be a date'),
		body('isLock').notEmpty().trim().isIn([true, false]),
		body('lectureId')
			.trim()
			.notEmpty()
			.custom(async (value) => {
				try {
					const lecture = await Lecture.findByPk(value);
					if (!lecture) {
						throw new Error(`Could not find Lecture`);
					}
				} catch (error) {
					throw new Error(`Could not find Lecture`);
				}
			}),
	],
	classController.putClass
);

router.put('/:classId/students', classController.putClassStudent);

router.patch('/:classId', classController.patchClassIsLock);

router.delete('/:classId/', classController.deleteClass);
module.exports = router;
