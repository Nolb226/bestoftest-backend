const sequelize = require('../util/database');
const { DataTypes, Op } = require('sequelize');
const Exam = require('./exam');
const Student = require('./student');
const Account = require('./account');
const dayjs = require('dayjs');
const classDetails = require('./classdetail');
const Class = sequelize.define(
	'class',
	{
		id: {
			type: DataTypes.STRING,
			// type: DataTypes.STRING(10),
			allowNull: false,
			unique: true,
			// autoIncrement: true,
			primaryKey: true,
		},
		totalStudent: {
			type: DataTypes.INTEGER(11),
			defaultValue: 0,
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		year: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			get: function () {
				return dayjs(this.getDataValue('year')).format('YY');
			},
		},
		semester: {
			type: DataTypes.TINYINT(1),

			allowNull: false,
		},
		isLock: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{ timestamps: false }
);

Class.prototype.createClassExam = async function (examData) {
	const exam = await Exam.create(examData);
	await this.addExam(exam);
	return exam;
};

Class.prototype.createClassStudent = async function (studentData) {
	const student =
		(await Student.findByPk(studentData.id)) ||
		(await Student.createAccount(studentData));
	this.totalStudent += 1;
	const existingDetail = await classDetails.findOne({
		where: { [Op.and]: { classId: this.id, studentId: student.id } },
	});

	if (!existingDetail) {
		const newDetail = await classDetails.create({
			classId: this.id,
			studentId: student.id,
		});
	}

	// await this.addStudent(student);
	// await student.addClass(this);
	// await student.addClass(this);
	// await this.addStudent(student);
	await this.save();
	return student;
};

Class.prototype.deleteClassStudent = async function (studentId) {
	const student = await Student.findByPk(studentId);
	await this.removeStudent(student);
	this.totalStudent -= 1;
	await this.save();
	return student;
};

Class.prototype.destroyClass = async function () {
	await classDetails.destroy({
		where: { classId: this.id },
	});
	await this.destroy();
};

Class.prototype.test = async function () {
	console.log(this.lectureId);
};

Class.addHook('beforeCreate', async function (classInstanse, options) {
	const lectureId = classInstanse.lectureId;
	const number = await Class.count({ where: { lectureId } });
	console.log(number);
	classInstanse.id = `${lectureId}${classInstanse.year}${
		classInstanse.semester
	}-${number + 1}`;
});

module.exports = Class;
