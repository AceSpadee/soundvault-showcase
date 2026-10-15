import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sequelize from '../config/connection.js';
import User from '../models/User.js';

async function createTestUser() {
    try {
        await sequelize.authenticate();

        const passwordHash = await bcrypt.hash('TestPassword123', 12);

        await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password_hash: passwordHash,
            role: 'USER',
            enabled: true
        });

        console.log('Test user created successfully.');
    } catch (error) {
        console.error('Unable to create test user:', error);
    } finally {
        await sequelize.close();
    }
}

createTestUser();