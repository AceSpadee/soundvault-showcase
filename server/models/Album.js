import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Album = sequelize.define('Album', {
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
    },
    musicbrainz_id: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    tableName: 'albums',
    timestamps: true,
    underscored: true 
})

export default Album;