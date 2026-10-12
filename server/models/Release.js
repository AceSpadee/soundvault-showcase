import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Release = sequelize.define('Release', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    album_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    edition: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Original",
    },
    release_year: {
        type: DataTypes.INTEGER,
    },
    musicbrainz_id: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    tableName: 'releases',
    timestamps: true,
    underscored: true 
})

export default Release;