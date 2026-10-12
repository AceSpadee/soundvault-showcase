import bcrypt from 'bcrypt';

async function hashPassword(plainTextPassword) {
    const saltRounds = 12; 

    try {
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

async function verifyPassword(plainTextPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
};

export {
    hashPassword,
    verifyPassword
}