'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('audio_files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            file_path: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            file_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            format: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            file_size: {
                type: Sequelize.BIGINT,
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
        await queryInterface.dropTable('audio_files');
    }
};
