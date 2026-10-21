function serverError(res, error) {
    console.error(error);

    return res.status(500).json({
        message: 'internal server error'
    })
};

export { serverError };