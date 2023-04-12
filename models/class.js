const sequelize = require('../util/database');
const { DataTypes, Op } = require('sequelize');
const Exam = require('./exam');
const Student = require('./student');
const Account = require('./account');
const classDetails = require('./classdetail');
const Major = require('./major');
const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');
const { throwError } = require('../util/helper');
const Lecture = require('./lecture');
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
				return dayjs(this.getDataValue('year')).format('YYYY');
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
	const { id } = studentData;
	const account = await Account.create({
		type: 'SV',
		// password: await bcrypt.hash(studentData.password),
		password: bcrypt.hash(studentData.password, 10),
	});
	const [student, created] = await Student.findOrCreate({
		where: { id },
		defaults: studentData,
	});
	if (created) {
		await student.setAccount(account);
	}
	const major = await Major.findByPk(studentData.majorId);
	await student.setMajor(major);
	await this.addStudent(student);
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

Class.beforeValidate(async function (classInstance) {
	const { lectureId, year, semester } = classInstance;
	const number = await Class.count({
		where: { [Op.and]: [{ lectureId }, { year }, { semester }] },
	});
	classInstance.id = `${lectureId}${year.slice(-2)}${semester}-${number + 1}`;
	classInstance.name = `${lectureId} - Nhóm ${(number + 1 + '').padStart(
		2,
		'0'
	)} - ${year}HK${semester}`;
});

module.exports = Class;
