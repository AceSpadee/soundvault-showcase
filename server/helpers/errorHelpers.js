function serverError(res, error) {
    console.error(error);

    return res.status(500).json({
        message: 'internal server error'
    })
};

function uniqueError(res, error) {
    console.error('Duplicate entry detected:', error.fields);

    return res.status(409).json({
        message: 'A record with this information already exists.'
    });
};

function foreignKeyError(res) {
    return res.status(400).json({
        message: "foreign key error"
    })
}

export { serverError, uniqueError, foreignKeyError };