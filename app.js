'use strict';
const port = process.env.PORT || 8080;

//Packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

//Utils
const sequelize = require('./util/database');
const app = express();
require('dotenv').config();

//Models

(() => {
	const Department = require('./models/department');
	const Major = require('./models/major');
	const Lecture = require('./models/lecture');
	const Class = require('./models/class');
	const Chapter = require('./models/chapter');
	const Question = require('./models/question');
	const Exam = require('./models/exam');

	const classDetails = require('./models/classdetail');

	const Student = require('./models/student');
	const Account = require('./models/account');

	const Teacher = require('./models/teacher');
	const Notification = require('./models/notification');

	const Student_Result = require('./models/student_result');
	const Exam_Result = require('./models/exam_result');

	const Permission_Group = require('./models/permission_group');
	const Function = require('./models/function');

	//Models relationship

	Department.hasMany(Major);
	Major.belongsTo(Department);

	Major.belongsToMany(Lecture, { through: 'lectureDetail' });
	Lecture.belongsToMany(Major, { through: 'lectureDetail' });

	Lecture.hasMany(Chapter);
	Chapter.belongsTo(Lecture);

	// Chapter.belongsToMany(Exam, { through: Exam_Result });
	// Exam.belongsToMany(Chapter, { through: Exam_Result });

	Chapter.hasMany(Question);
	Question.belongsTo(Chapter);

	Student.belongsTo(Account, { foreignKey: 'accountId' });
	Account.hasOne(Student, { foreignKey: 'accountId' });

	Teacher.belongsTo(Account, { foreignKey: 'accountId' });
	Account.hasOne(Teacher, { foreignKey: 'accountId' });

	Student.belongsTo(Major);
	Major.hasMany(Student);

	// Major.belongsTo(Teacher, { foreignKey: 'headOfMajor' });
	// Teacher.hasOne(Major, { foreignKey: 'headOfMajor' });

	Student.belongsToMany(Class, {
		through: classDetails,
		foreignKey: 'studentId',
	});

	Student.hasMany(classDetails);
	classDetails.belongsTo(Student);

	Class.hasMany(classDetails);
	classDetails.belongsTo(Class);

	Class.belongsToMany(Student, {
		through: classDetails,
		foreignKey: 'classId',
	});

	Student.belongsToMany(Exam, {
		through: Student_Result,
		timestamps: false,
		foreignKey: 'studentId',
	});
	Exam.belongsToMany(Student, {
		through: Student_Result,
		timestamps: false,
		foreignKey: 'examId',
	});

	Student_Result.belongsToMany(Chapter, {
		through: 'examchapter',
		timestamps: false,
	});
	Chapter.belongsToMany(Student_Result, {
		through: 'examchapter',
		timestamps: false,
	});

	Exam.hasMany(Student_Result);
	Student_Result.belongsTo(Exam);

	Student.hasMany(Student_Result);
	Student_Result.belongsTo(Exam);

	Teacher.belongsTo(Department);
	Department.hasMany(Teacher);

	Department.belongsTo(Teacher, { foreignKey: 'headOfDepartment' });
	Teacher.hasOne(Department, { foreignKey: 'headOfDepartment' });

	// Teacher.hasOne(Lecture, { foreignKey: 'headOfLecture' });
	// Lecture.belongsTo(Teacher, { foreignKey: 'headOfLecture' });

	Teacher.belongsToMany(Lecture, { through: 'teach', timestamps: false });
	Lecture.belongsToMany(Teacher, { through: 'teach', timestamps: false });

	Teacher.hasMany(Class);
	Class.belongsTo(Teacher);

	Lecture.hasMany(Class);
	Class.belongsTo(Lecture);

	Class.hasMany(Exam);
	Exam.belongsTo(Class);

	// Exam.belongsToMany(Question, { through: Exam_Result });
	// Question.belongsToMany(Exam, { through: Exam_Result });

	// Student.belongsToMany(Exam, {
	// 	through: Exam_Result,
	// 	timestamps: false,
	// 	foreignKey: 'studentId',
	// });
	// Exam.belongsToMany(Student, {
	// 	through: Exam_Result,
	// 	timestamps: false,
	// 	foreignKey: 'examId',
	// });

	Class.hasMany(Notification);
	Notification.belongsTo(Class);

	Account.belongsToMany(Permission_Group, {
		through: 'groupdetail',
		timestamps: false,
		as: 'permissions',
	});
	Permission_Group.belongsToMany(Account, {
		through: 'groupdetail',
		timestamps: false,
	});

	Permission_Group.belongsToMany(Function, {
		through: 'functionDetail',
		timestamps: false,
	});
	Function.belongsToMany(Permission_Group, {
		through: 'functionDetail',
		timestamps: false,
	});
})();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'excels/');
	},
	filename: (req, file, cb) => {
		let extension = file.originalname.split('.').pop();
		cb(null, `${uuidv4()}.${extension}`);
	},
});

//Routes define
const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/question');
const classesRoutes = require('./routes/class');
const chaptersRoutes = require('./routes/chapter');
const testRoutes = require('./routes/test');
const departmentRoutes = require('./routes/department');
const majorRoutes = require('./routes/major');
const lectureRoutes = require('./routes/lecture');
const { checkPermission } = require('./middleware/check-permission');
//Middleware

app.use(bodyParser.json());
app.use(multer({ storage }).single('fileInput'));
// app.use(express.static(path.join(__dirname, 'excels')));
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	next();
});
//Routes seperate paths

app.use('/auth', authRoutes);
app.use('/departments', departmentRoutes);
app.use('/majors', majorRoutes);
app.use('/lectures', lectureRoutes);
app.use('/questions', questionsRoutes);
app.use('/classes', classesRoutes);
app.use('/chapters', chaptersRoutes);
app.use('/test', testRoutes);
//App start when connected to database
console.log(port);
app.get('/', (req, res) => {
	res.send(Hiii);
});

sequelize
	// .sync({ force: true })
	.sync()

	.then(() => {
		app.listen(port, function () {
			console.log(
				'Express server listening on port %d in %s mode',
				this.address().port,
				app.settings.env
			);
		});
	})
	.catch((err) => console.log('Fail to connect to the database ' + err));
