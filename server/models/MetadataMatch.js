import { DataTypes } from "sequelize";
import sequelize from "../config/connection.js";

const MetadataMatch = sequelize.define('MetadataMatch', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    audio_file_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    external_id: {
        type: DataTypes.STRING,
    },
    confidence: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "UNMATCHED",
    }
}, {
    tableName: 'metadata_matches',
    timestamps: true,
    underscored: true 
})

export default MetadataMatch;