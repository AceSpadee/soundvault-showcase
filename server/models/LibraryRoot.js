import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const LibraryRoot = sequelize.define('LibraryRoot', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    enabled: {
       type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, 
    }
}, {
    tableName: 'library_roots',
    timestamps: true,
    underscored: true 
})

export default LibraryRoot;