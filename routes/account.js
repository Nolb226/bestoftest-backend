const router = require('express').Router();
const accountController = require('../controllers/accountController');
const { isAuth } = require('../middleware/is-auth');
const { isWho } = require('../middleware/is-who');

router.use(isAuth, isWho);

router.get('/', accountController.getUserAccount);

router.get('/another-route', (req, res) => {
	// router code here
});

module.exports = router;
