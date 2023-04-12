const router = require('express').Router();
const adminController = require('../controllers/admin');

router.get('/accounts', adminController.getAllAccounts);
router.get('/accounts/:accountId', adminController.getAccount);

router.get('/classes', adminController.getAllClasses);

router.get('/permissions', adminController.getAllPermissions);
router.get('/exams', adminController.getAllExams);
module.exports = router;
