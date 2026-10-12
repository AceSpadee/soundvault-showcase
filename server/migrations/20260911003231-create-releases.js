'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('releases', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            album_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'albums',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            edition: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "Original",
            },
            release_year: {
                type: Sequelize.INTEGER,
            },
            musicbrainz_id: {
                type: Sequelize.STRING,
                unique: true,
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
        await queryInterface.dropTable('releases');
    }
};
