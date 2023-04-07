const router = require('express').Router();
const { body } = require('express-validator');
const majorController = require('../controllers/majorController');

router.get('/', majorController.getMajors);

router.get('/another-route', (req, res) => {
	// router code here
});

router.get('/:majorId/lectures', majorController.getMajorLectures);

router.get(
	'/:majorId/lectures/:lectureId/chapters',
	majorController.getMajorChapters
);

router.get(
	'/:majorId/lectures/:lectureId/chapters/:chapterId/questions',
	majorController.getMajorQuestions
);

router.post(
	'/:majorId/lectures/:lectureId/chapters/:chapterId/questions',
	[
		body('questions.*.description').trim().notEmpty(),
		body('questions.*.answerA').trim().notEmpty(),
		body('questions.*.answerC').trim().notEmpty(),
		body('questions.*.answerB').trim().notEmpty(),
		body('questions.*.answerD').trim().notEmpty(),
		body('questions.*.correctAns')
			.trim()
			.notEmpty()
			.isIn(['A', 'B', 'C', 'D'])
			.withMessage('Invalid answer'),
		body('questions.*.difficulty')
			.trim()
			.notEmpty()
			.isIn(['Dễ', 'Khó'])
			.withMessage('Invalid difficulty'),
	],
	majorController.postMajorQuestions
);

module.exports = router;
