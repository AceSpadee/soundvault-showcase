
import assert from 'node:assert/strict';

import sequelize from '../config/connection.js';
import User from '../models/User.js';
import authenticateUser from '../services/authService.js';

const email = 'authtest2@example.com';
const password = 'TestPassword123!';

let testUser;
let originalEnabled;

try {
    // ARRANGE
    assert.ok(email && password, 'Missing test credentials');

    testUser = await User.findOne({
        where: { email }
    });

    assert.ok(testUser, 'Test user does not exist');

    originalEnabled = testUser.enabled;

    assert.equal(
        originalEnabled,
        true,
        'Test user must initially be enabled'
    );

    // TEST 1: Correct credentials
    const validUser = await authenticateUser(email, password);

    assert.ok(validUser, 'Correct credentials should return a user');
    assert.equal(validUser.id, testUser.id);

    console.log('Correct credentials: PASS');

    // TEST 2: Incorrect password
    const invalidUser = await authenticateUser(
        email,
        `${password}-incorrect`
    );

    assert.equal(invalidUser, null);

    console.log('Incorrect password: PASS');

    // TEST 3: Nonexistent email
    const nonexistentUser = await authenticateUser(
        `missing-${Date.now()}@example.invalid`,
        password
    );

    assert.equal(nonexistentUser, null);

    console.log('Nonexistent email: PASS');

    // TEST 4: Disabled account
    await testUser.update({ enabled: false });

    const disabledUser = await authenticateUser(email, password);

    assert.equal(disabledUser, null);

    console.log('Disabled account: PASS');
    console.log('M54 Part 2: ALL TESTS PASSED');

} catch (error) {
    console.error('M54 Part 2 FAILED:', error.message);
    process.exitCode = 1;

} finally {
    // Restore the original account status.
    if (testUser && originalEnabled !== undefined) {
        await testUser.update({ enabled: originalEnabled });
    }

    await sequelize.close();
}