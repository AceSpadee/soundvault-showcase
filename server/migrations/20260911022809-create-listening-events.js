'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('listening_events', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            recording_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'recordings',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            audio_file_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'audio_files',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            started_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            ended_at: {
                type: Sequelize.DATE
            },
            seconds_listened: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            completed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            skipped: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
        await queryInterface.dropTable('listening_events');
    }
};
