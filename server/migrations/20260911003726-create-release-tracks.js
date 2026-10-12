'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('release_tracks', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            release_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'releases',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            recording_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'recordings',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            disc_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            track_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.dropTable('release_tracks');
    }
};
