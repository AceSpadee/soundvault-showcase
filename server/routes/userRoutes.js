import express from 'express';
import User from '../models/User.js';
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { serverError, uniqueError, foreignKeyError } from '../helpers/errorHelpers.js';
import { hashPassword } from '../services/passwordService.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
    try {
        const user = await User.findAll({
            attributes: { exclude: ['password_hash'] }
        });

        res.status(200).json(user);
    } catch (error) {
        serverError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = {}

        if (typeof username !== "string") {
            return res.status(400).json({
                message: 'username must be string'
            })
        } else if (username.trim() === '') {
            return res.status(400).json({
                message: 'username cannot be blank'
            })
        } else {
            user.username = username.trim();
        }

        if (typeof email !== "string") {
            return res.status(400).json({
                message: 'email must be string'
            })
        } else if (email.trim() === '') {
            return res.status(400).json({
                message: 'email cannot be blank'
            })
        } else {
            user.email = email.trim();
        }

        if (typeof password !== "string") {
            return res.status(400).json({
                message: 'password must be string'
            })
        } else if (password.trim() === '') {
            return res.status(400).json({
                message: 'password cannot be blank'
            })
        } else {
            const hashedPassword = await hashPassword(password)
            user.password_hash = hashedPassword;
        }

        user.role = 'USER';
        user.enabled = true;

        const createdUser = await User.create(user);

        const safeUser = createdUser.toJSON();
        delete safeUser['password_hash']

        res.status(201).json(safeUser);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                message: "no user found"
            })
        }

        res.status(200).json(user);
    } catch (error) {
        serverError(res, error);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const foundUser = await User.findByPk(userId);

        if (!foundUser) {
            return res.status(404).json({
                message: "no user found"
            })
        }

        const { username, email, password } = req.body;

        let user = {}

        if (typeof username !== "string") {
            return res.status(400).json({
                message: 'username must be string'
            })
        } else if (username.trim() === '') {
            return res.status(400).json({
                message: 'username cannot be blank'
            })
        } else {
            user.username = username.trim();
        }

        if (typeof email !== "string") {
            return res.status(400).json({
                message: 'email must be string'
            })
        } else if (email.trim() === '') {
            return res.status(400).json({
                message: 'email cannot be blank'
            })
        } else {
            user.email = email.trim();
        }

        if (password !== undefined) {
            if (typeof password !== "string") {
                return res.status(400).json({
                    message: 'password must be string'
                })
            } else if (password.trim() === '') {
                return res.status(400).json({
                    message: 'password cannot be blank'
                })
            } else {
                const hashedPassword = await hashPassword(password)
                user.password_hash = hashedPassword;
            }
        }

        const updatedUser = await foundUser.update(user);

        const safeUser = updatedUser.toJSON();
        delete safeUser['password_hash']

        res.status(200).json(safeUser);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return uniqueError(res, error);
        }

        serverError(res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "no user found"
            })
        }

        await user.destroy();

        res.status(200).json({
            message: 'user deleted'
        });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return foreignKeyError(res);
        }
        
        serverError(res, error);
    }
});

export default router;