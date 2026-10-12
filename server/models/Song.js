import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    primary_artist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'songs',
    timestamps: true,
    underscored: true 
})

export default Song;