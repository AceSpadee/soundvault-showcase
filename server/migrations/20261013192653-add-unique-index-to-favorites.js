'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.addConstraint('favorites', {
            fields: ['user_id', 'recording_id'],
            type: 'unique',
            name: 'unique_favorite_recording'
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.removeConstraint('favorites', 'unique_favorite_recording');
    }
};
