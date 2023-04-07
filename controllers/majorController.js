const { validationResult } = require('express-validator');
const Chapter = require('../models/chapter');
const Lecture = require('../models/lecture');
const Major = require('../models/major');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');
const Question = require('../models/question');

module.exports.getMajors = async function (req, res, _) {
	try {
		const majors = await Major.findAll({ attributes: ['id', 'name'] });
		successResponse(res, 200, majors);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getMajorLectures = async (req, res, _) => {
	try {
		const { majorId } = req.params;
		const major = await Major.findByPk(majorId);
		if (!major) {
			throwError('Major not found', 404);
		}
		const lectures = await major.getLectures();
		successResponse(res, 200, lectures, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getMajorChapters = async (req, res, _) => {
	try {
		const { majorId, lectureId } = req.params;
		const lecture = await Lecture.findByPk(lectureId, { through: { majorId } });
		if (!lecture) {
			throwError(`Couldn't find lecture`, 404);
		}
		const chapters = await lecture.getChapters();
		const result = chapters.map((chapter) => {
			return {
				...chapter.dataValues,
				id: chapter.id.split('-')[1],
			};
		});
		successResponse(res, 200, result);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.getMajorQuestions = async (req, res, _) => {
	try {
		const { majorId, chapterId, lectureId } = req.params;
		const major = await Major.findByPk(majorId);
		if (!major) {
			throwError('Major not found', 404);
		}
		const lecture = await major.getLectures({ where: { id: lectureId } });
		if (!lecture.length) {
			throwError(`Couldn't find lecture`, 404);
		}
		const chapter = await lecture[0].getChapters({
			where: { id: `${lectureId}-${chapterId}` },
		});
		if (!chapter.length) {
			throwError('Could not find chapter', 404);
		}
		const questions = await chapter[0].getQuestions({
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
		});
		console.log(1);
		successResponse(res, 200, questions);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.postMajorQuestions = async (req, res, _) => {
	try {
		const { majorId, chapterId, lectureId } = req.params;
		const errors = validationResult(req.body);
		if (!errors.isEmpty()) {
			throwError(errors.array(), 409);
		}
		const { questions } = req.body;
		const major = await Major.findByPk(majorId);
		if (!major) {
			throwError('Major not found', 404);
		}
		const lecture = await major.getLectures({ where: { id: lectureId } });
		if (!lecture.length) {
			throwError(`Couldn't find lecture`, 404);
		}
		const chapter = await lecture[0].getChapters({
			where: { id: `${lectureId}-${chapterId}` },
		});
		if (!chapter.length) {
			throwError('Could not find chapter', 404);
		}
		const result = await Question.bulkCreate(questions);
		await chapter[0].addQuestions(result);
		const newTotals = await Question.count({
			where: { chapterId: `${lectureId}-${chapterId}` },
		});
		chapter[0].numberOfQuestions = newTotals;
		await chapter[0].save();
		successResponse(res, 201, { newTotals }, req.method);
	} catch (error) {
		errorResponse(res, error);
	}
};

exports.postQuestion = async function (req, res, _) {};
