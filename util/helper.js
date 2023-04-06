exports.errorResponse = function (res, error, data = {}) {
	if (!error.message) {
		return res.status(error.statusCode || 500).json({
			// status: error.statusCode || 500,
			error: error,
			// data,
		});
	}
	return res.status(error.statusCode || 500).json({
		// status: error.statusCode || 500,
		error: error.message,
		// data,
	});
};

exports.successResponse = function (res, status, data, method = 'GET') {
	let message;
	if (method === 'GET') {
		message = 'Fetch successfully';
	}
	if (method === 'PUT') {
		message = 'Update successfully';
	}
	if (method === 'DELETE') {
		message = 'Delete successfully';
	}
	if (method === 'POST') {
		message = 'Created successfully';
	}

	return res.status(status).json({
		status,
		message,
		data,
	});
};

exports.throwError = function (message, status) {
	let error;
	console.log(typeof message);
	if (typeof message === 'object') {
		error = message.map(({ value, msg: message, param }) => {
			return { value, message, param };
		});
	} else {
		error = [{ message }];
	}
	error.statusCode = status;
	throw error;
};
