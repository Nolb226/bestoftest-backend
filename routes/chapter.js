const router = require('express').Router();

const chapterController = require('../controllers/chapterController');

router.get('/', chapterController.getChapters);

router.get('/:chapterId/questions', chapterController.getChapterQuestions);

router.get(
	'/:chapterId/question/:questionId',
	chapterController.getChapterQuestion
);

router.post('/:chapterId/question/', chapterController.postQuestion);

router.post('/:chapterId/questions/', chapterController.postQuestions);

module.exports = router;
