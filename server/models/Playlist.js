import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'playlists',
    timestamps: true,
    underscored: true 
})

export default Playlist;