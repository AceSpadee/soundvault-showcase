import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Recording = sequelize.define('Recording', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Original",
    },
    musicbrainz_id: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    tableName: 'recordings',
    timestamps: true,
    underscored: true 
})

export default Recording;