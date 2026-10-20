import { env } from 'cloudflare:workers';

export async function demoRateLimiter(req, res, next) {
    try {
        const user_id = req.demoSessionId;

        const results = await env.DEMO_RATE_LIMITER.limit({
            key: user_id
        });

        if (!results.success) {
            return res.status(429).json({
                message: "Too many requests"
            })
        };
        next();

    } catch (error) {
        next(error);
    }
};