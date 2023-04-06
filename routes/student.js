'use strict';
const { successResponse, errorResponse } = require('../util/helper');
const studentController = require('../controllers/studentController');
const { checkPermission } = require('../middleware/check-permission');
const router = require('express').Router();
const studentRouteCheck = checkPermission.bind({ path: 'students' });
router.get('/', studentRouteCheck, studentController.getStudents);

router.get('/:studentId', studentRouteCheck, studentController.getStudent);

module.exports = router;
