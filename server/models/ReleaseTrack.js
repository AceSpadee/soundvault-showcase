import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const ReleaseTrack = sequelize.define('ReleaseTrack', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    release_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recording_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    disc_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    track_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'release_tracks',
    timestamps: true,
    underscored: true 
})

export default ReleaseTrack;