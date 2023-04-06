const Question = require('../models/question');
const sequelize = require('../util/database');
const {
	successResponse,
	errorResponse,
	throwError,
} = require('../util/helper');

exports.getQuestions = async function (req, res, _) {
	try {
		const chaptersArray = req.query.chapters.split(',');
		const { limit } = req.query;
		const chapterIds = chaptersArray.join('" OR chapterId= "');
		const result = await sequelize.query(
			`SELECT questions.id,questions.status as status,description,correctAns,answerA,answerB,answerC,answerD, chapters.id as chapterId FROM exams JOIN classes ON exams.classId = classes.id JOIN lectures ON classes.lectureId= lectures.id JOIN Chapters ON lectures.Id= chapters.lectureId JOIN questions ON questions.chapterId=chapters.id WHERE chapterId ="${chapterIds}" AND NOT questions.status= "2" ORDER BY Rand() LIMIT ${limit};`,
			{ type: sequelize.QueryTypes.SELECT }
		);

		successResponse(res, 200, result);
		// successResponse(res, 200, { questions: result, total });
	} catch (error) {
		console.log(error);
		errorResponse(res, error, [{}]);
	}
};

exports.getQuestion = async function (req, res, _) {
	try {
		const { questionId } = req.params;
		const question = await Question.findByPk(questionId);
		if (!question) {
			throwError('Question not found', 404);
		}
		successResponse(res, 200, question);
	} catch (error) {
		errorResponse(res, error, {});
	}
};

exports.putQuestion = async (req, res, _) => {
	const { questionId } = req.params;

	const question = await Question.findByPk(questionId);
};

exports.deleteQuestion = async (req, res, _) => {};

exports.handleQuestion = async (req, res, _) => {
	const { StudentAns } = req.body;

	const response = await Promise.all(
		StudentAns.map(async (question) => {
			const questionInData = await Question.findOne({
				where: { description: question.description },
			});
			return {
				questionInData,
				correct: question.ans === questionInData.correctAns,
			};
		})
	);
	res.status(200).json({ message: 'complete', response });
};
