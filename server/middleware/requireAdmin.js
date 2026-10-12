function requireAdmin(req, res, next) {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: 'not authorized'
        })
    }

    next();
};

export default requireAdmin;