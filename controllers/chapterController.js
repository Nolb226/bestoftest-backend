const { validationResult } = require('express-validator');
const Chapter = require('../models/chapter');
const Question = require('../models/question');
const {
	throwError,
	successResponse,
	errorResponse,
} = require('../util/helper');

module.exports.getChapters = async function (req, res, _) {
	try {
		const chapters = await Chapter.findAll();
		successResponse(res, 200, chapters);
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.getChapter = async function (req, res, _) {};

module.exports.getChapterQuestions = async function (req, res, _) {
	try {
		const { chapterId } = req.params;
		const chapter = await Chapter.findByPk(chapterId);
		if (!chapter) {
			throwError('Could not find chapter', 404);
		}
		console.log(chapter);
		console.log(await Question.count({ where: { chapterId } }));
		const questions = await chapter.getQuestions({
			attributes: [
				'id',
				'correctAns',
				'description',
				'answerA',
				'answerB',
				'answerC',
				'answerD',
				'difficulty',
				'status',
			],
			include: { all: true },
		});

		successResponse(res, 200, questions);
	} catch (error) {
		errorResponse(res, error);
	}
};

module.exports.getChapterQuestion = async (req, res, _) => {
	try {
		const { chapterId, questionId } = req.params;
		const chapter = await Chapter.findByPk(chapterId);
		if (!chapter) {
			throwError('Chapter not found', 404);
		}
		const question = await Question.findByPk(questionId);
		if (!question) {
			throwError('Question not found', 404);
		}
		const has = await chapter.hasQuestion(question);
		if (!has) {
			throwError(`${chapter.name} doesn't have that question `, 404);
		}
		successResponse(res, 200, question);
	} catch (error) {
		errorResponse(res, error, {});
	}
};

exports.postQuestion = async (req, res, _) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throwError();
		}
		const { chapterId } = req.params;
		const chapter = await Chapter.findByPk(chapterId);
		if (!chapter) {
			throwError('Chapter not found', 404);
		}
		const {
			description,
			correctAns,
			answerA,
			answerB,
			answerC,
			answerD,
			difficulty,
		} = req.body;
		const question = await Question.create({
			description,
			correctAns,
			answerA,
			answerB,
			answerC,
			answerD,
			difficulty,
		});
		await chapter.addQuestion(question);
		successResponse(res, 201, question, 'POST');
	} catch (error) {
		errorResponse(res, error, {});
	}
};

exports.postQuestions = async (req, res, _) => {
	try {
		const { chapterId } = req.params;
		const chapter = await Chapter.findByPk(chapterId);
		if (!chapter) {
			throwError();
		}
		const questions = await Question.bulkCreate(req.body);
		await chapter.addQuestions(questions);
		successResponse(res, 201, questions, 'POST');
	} catch (error) {
		errorResponse(res, error, [{}]);
	}
};

exports.putQuestion = async (req, res, next) => {
	try {
		const { chapterId, questionId } = req.params;
		const chapter = await Chapter.findByPk(chapterId);
		if (!chapter) {
			throwError('Chapter not found', 404);
		}
		const question = await Question.findByPk(questionId);
		if (!question) {
			throwError('Question not found', 404);
		}
		const has = await chapter.hasQuestion(question);
		if (!has) {
			throwError(`${chapter.name} doesn't have that question`, 404);
		}
		const {
			description,
			correctAns,
			answerA,
			answerB,
			answerC,
			answerD,
			difficulty,
		} = req.body;
		await question.update({
			description,
			correctAns,
			answerA,
			answerB,
			answerC,
			answerD,
			difficulty,
		});
		await question.save();
		successResponse(res, 200, question, 'PUT');
	} catch (error) {
		errorResponse(res, error, {});
	}
};
