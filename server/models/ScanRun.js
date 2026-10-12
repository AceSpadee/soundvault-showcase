import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const ScanRun = sequelize.define('ScanRun', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    library_root_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
    },
    started_at: {
        type: DataTypes.DATE,
    },
    finished_at: {
        type: DataTypes.DATE,
    },
    files_found: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    files_added: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'scan_runs',
    timestamps: true,
    underscored: true 
})

export default ScanRun;