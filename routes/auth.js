const router = require('express').Router();
const authController = require('../controllers/auth');
const { body } = require('express-validator');
const Account = require('../models/account');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
router.post('/login', authController.login);

router.post(
	'/signup',
	[
		body('password')
			.trim()
			.notEmpty()
			.isLength({ min: 8 })
			.withMessage('Password need to be at least 8 characters long'),
		body('username')
			.trim()
			.notEmpty()
			.isInt()
			.withMessage('Username must be your personalID')
			.custom(async (value, { req }) => {
				const isExist =
					(await Teacher.findByPk(value)) || (await Student.findByPk(value));
				if (isExist) {
					throw new Error('Account already exists');
				}
			}),

		body('dob')
			.trim()
			.notEmpty()
			.isISO8601()
			.withMessage('must be in ISO8601 format')
			.isDate()
			.withMessage('invalid day received'),
		body('fullname').trim().notEmpty().isString().withMessage('Invalid name'),
		body('type')
			.trim()
			.notEmpty()
			.isIn(['SV', 'GV'])
			.withMessage('Invalid type'),
	],

	//min : 8
	authController.signup
);

module.exports = router;
