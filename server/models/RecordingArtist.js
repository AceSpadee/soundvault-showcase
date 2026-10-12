import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const RecordingArtist = sequelize.define('RecordingArtist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    recording_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PRIMARY",
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    }
}, {
    tableName: 'recording_artists',
    timestamps: true,
    underscored: true 
})

export default RecordingArtist;