const router = require('express').Router();
const adminController = require('../controllers/admin');

router.get('/accounts', adminController.getAllAccounts);

router.get('/another-route', (req, res) => {
	// router code here
});

module.exports = router;
