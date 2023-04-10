const router = require('express').Router();
const adminController = require('../controllers/admin');

router.get('/accounts', adminController.getAllAccounts);

router.get('/classes', adminController.getAllClasses);

module.exports = router;
