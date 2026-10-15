import express from 'express';
import authenticateUser from '../services/authService.js';
import requireAuth from '../middleware/requireAuth.js';
import { env } from 'cloudflare:workers';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({
                message: 'Email cannot be blank'
            });
        }

        const loginKey = `login:${email.trim().toLowerCase()}`;

        const { success } = await env.LOGIN_RATE_LIMITER.limit({
            key: loginKey
        });

        if (!success) {
            return res.status(429).json({
                message: 'Too many login attempts, please try again later.'
            });
        }

        if (typeof password !== 'string' || password.trim() === '') {
            return res.status(400).json({
                message: 'Password cannot be blank'
            });
        }

        const user = await authenticateUser(email.trim(), password);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                console.error('Session regenerate error:', error);
                
                return res.status(500).json({
                    message: 'Unable to log in'
                });
            }

            req.session.userId = user.id;

            req.session.save((error) => {
                if (error) {
                    console.error('Session save error:', error);

                    return res.status(500).json({
                        message: 'Unable to log in'
                    });
                }

                return res.status(200).json({
                    message: 'Authenticated',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            });
        });
    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/logout', async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: 'Unable to log out'
            });
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({
            message: 'logged out'
        });
    });
});

router.get('/me', requireAuth, (req, res) => {
    const { id, username, email, role } = req.user

    return res.status(200).json({
        id,
        username,
        email,
        role
    })
});

export default router;