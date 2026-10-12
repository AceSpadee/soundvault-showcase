import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const Favorite = sequelize.define('Favorite', {
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
}, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true 
})

export default Favorite;