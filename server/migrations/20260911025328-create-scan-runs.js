'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('scan_runs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            library_root_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'library_roots',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "PENDING"
            },
            started_at: {
                type: Sequelize.DATE,
            },
            finished_at: {
                type: Sequelize.DATE,
            },
            files_found: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            files_added: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
        await queryInterface.dropTable('scan_runs');
    }
};
