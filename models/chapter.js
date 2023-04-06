const sequelize = require('../util/database');
const Lecture = require('./lecture');
const Question = require('./question');
const DataTypes = require('sequelize').DataTypes;

const Chapter = sequelize.define('chapter', {
	id: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
		unique: true,
	},
	name: {
		type: DataTypes.STRING(50),
		allowNull: false,
	},
	numberOfQuestions: {
		type: DataTypes.INTEGER(11),
		allowNull: false,
	},
});

Chapter.addHook('beforeCreate', async function (chapter) {
	const { lectureId } = chapter;
	const lecture = await Lecture.findByPk(lectureId);

	const number = await Question.count({ where: { lectureId } });
	chapter.id = `${lecture.name}-${number + 1}`;
});

Chapter.prototype.addChapterQuestion = async function ({
	id,
	correctAns,
	answerA,
	answerB,
	answerC,
	answerD,
	desciption,
	difficulty,
}) {};

module.exports = Chapter;
