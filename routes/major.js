const router = require('express').Router();
const majorController = require('../controllers/majorController');

router.get('/', majorController.getMajors);

router.get('/another-route', (req, res) => {
	// router code here
});

module.exports = router;
