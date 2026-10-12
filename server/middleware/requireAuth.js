import User from '../models/User.js';

async function requireAuth(req, res, next) {
    try {
        if (!req.session.userId)  {
            return res.status(401).json({
                message: 'no user signed in'
            })
        }
        const user = await User.findByPk(req.session.userId);

        if (!user || !user.enabled) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'error'
        })
    }
}

export default requireAuth;