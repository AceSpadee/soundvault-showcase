import User from "../models/User.js";
import { verifyPassword } from "./passwordService.js";

async function authenticateUser(email, password) {
    const user = await User.findOne({
        where: {
            email: email
        }
    })

    if (!user || user.enabled === false) {
        return null
    }

    const isMatch = await verifyPassword(password, user.password_hash)

    if (!isMatch) {
        return null
    }

    return user
};

export default authenticateUser;