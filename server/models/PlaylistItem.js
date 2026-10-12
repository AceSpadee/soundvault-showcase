import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const PlaylistItem = sequelize.define('PlaylistItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recording_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'playlist_items',
    timestamps: true,
    underscored: true 
})

export default PlaylistItem;