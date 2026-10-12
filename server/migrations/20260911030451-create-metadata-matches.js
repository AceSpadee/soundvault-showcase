'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('metadata_matches', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            audio_file_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'audio_files',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            external_id: {
                type: Sequelize.STRING,
            },
            confidence: {
                type: Sequelize.INTEGER,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "UNMATCHED",
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
        await queryInterface.dropTable('metadata_matches');
    }
};
