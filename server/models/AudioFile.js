import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const AudioFile = sequelize.define('AudioFile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    recording_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    duration: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    is_missing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'audio_files',
    timestamps: true,
    underscored: true 
})

export default AudioFile;