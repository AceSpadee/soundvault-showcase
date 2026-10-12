import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Artist = sequelize.define('Artist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    musicbrainz_id: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    tableName: 'artists',
    timestamps: true,
    underscored: true 
})

export default Artist;