import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const ListeningEvent = sequelize.define('ListeningEvent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recording_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    audio_file_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    ended_at: {
        type: DataTypes.DATE
    },
    seconds_listened: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    skipped: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'listening_events',
    timestamps: true,
    underscored: true 
})

export default ListeningEvent;