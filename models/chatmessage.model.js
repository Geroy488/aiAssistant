const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        chatMessageId: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        AccountId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        conversationId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: { 
            type: DataTypes.ENUM('user', 'assistant'), 
            allowNull: false 
        },
        message: { 
            type: DataTypes.TEXT, 
            allowNull: false 
        },
        timestamp: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        }
    };

    const options = {
        timestamps: false,
        indexes: [
            {
                fields: ['AccountId', 'conversationId']
            },
            {
                fields: ['timestamp']
            }
        ]
    };

    return sequelize.define('ChatMessage', attributes, options);
}