const router = require('express').Router();
const { body } = require('express-validator');
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getDepartments);

router.get('/:departmentId', departmentController.getDepartment);

router.get('/:departmentId/majors', departmentController.getMajorsInDepartment);

router.post(
	'/',
	[
		body('id')
			.trim()
			.notEmpty()
			.isLength({ min: 2 })
			.withMessage('ID need to be at least 3 characters long'),
		body('name').trim().notEmpty().isString().withMessage('Invalid name'),
	],
	departmentController.postDepartment
);

router.put(
	'/:departmentId',
	[
		body('id')
			.trim()
			.notEmpty()
			.isLength({ min: 2 })
			.withMessage('ID need to be at least 3 characters long'),
		body('name').trim().notEmpty().isString().withMessage('Invalid name'),
	],
	departmentController.putDepartment
);

router.delete('/:departmentId', departmentController.deleteDepartment);

module.exports = router;
