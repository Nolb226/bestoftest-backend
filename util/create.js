'use strict';

const Department = require('../models/department');
const Major = require('../models/major');
const Lecture = require('../models/lecture');
const Class = require('../models/class');
const Chapter = require('../models/chapter');
const Question = require('../models/question');
const Exam = require('../models/exam');
const Student_Result = require('../models/student_result');
const Exam_Result = require('../models/exam_result');

const Account = require('../models/account');

const Student = require('../models/student');
const Teacher = require('../models/teacher');

const Notification = require('../models/notification');

const Permission_Group = require('../models/permission_group');
const Function = require('../models/function');

exports.create = async function () {
	const Account1 = await Lecture.create({
		id: '841109',
		name: 'Cơ sở dữ liệu',
		credits: 4,
		totalChapters: 6,
	})
		.then((Lecture) => {
			return Lecture.createTeacher({
				id: '10991',
				fullname: 'Nguyễn Thanh Sang',
				dob: new Date(),
			});
		})
		.then((Teacher) => {
			return Teacher.createAccount({ password: '123', type: 'GV' });
		});

	const Teacher1 = await Teacher.findByPk('10991');
	const Chap = await Lecture.findByPk('841109').then((Lecture) => {
		return Lecture.createChapter({
			id: 'WEBC1',
			name: 'HTML',
			numberOfQuestions: 2,
		});
	});

	const Lec = await Lecture.findByPk('841109');
	const Class1 = await Lec.createClass({
		id: 'a111',
		name: 'Web ứng dụng 1',
		password: '123',
		year: new Date(2003),
		semester: 2,
	});
	await Teacher1.setClasses(Class1);
	const Q1 = await Chap.createQuestion({
		id: '11111',
		correctAns: 'A',
		description: 'HTML là gì ?',
		answerA: 'Ngôn ngữ đánh dấu siêu văn bản',
		answerB: 'Ngôn ngữ lập trình bậc thấp',
		answerC: 'Ngôn ngữ đánh dấu văn bản',
		answerD: 'Ngôn ngữ lập trình bậc cao',
		difficulty: 'Dễ',
	});
	const Q2 = await Chap.createQuestion({
		id: '11112',
		correctAns: 'B',
		description: 'Có bao nhiêu cách liên kết file CSS',
		answerA: '4',
		answerB: '3',
		answerC: '1',
		answerD: '2',
		difficulty: 'Dễ',
	});
	const newStudent = await Student.create({
		id: '123456',
		fullname: 'John Doe',
		dob: new Date('1995-10-02'),
	});

	// create a new exam
	const newExam = await Exam.create({
		id: 'EXM001',
		name: 'JavaScript Basics',
		timeStart: new Date('2023-04-01T09:00:00Z'),
		timeEnd: new Date('2023-04-01T10:00:00Z'),
		duration: 60,
		totalQuestions: 10,
		ratioQuestions: 0.5,
	});

	// associate the new exam with the new student and assign a grade
	await newStudent.addExam(newExam, { through: { grade: 9 } });

	// await Student1.createAccount({ password: '123123', type: 'SV' });
	// await Student1.addExam(Exam1, { through: { grade: 8 } });
};
