const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() { 
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    
    await connection.end();

    const sequelize = new Sequelize(database, user, password, { host: 'localhost', dialect: 'mysql' });

    // Initialize models
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Preferences = require('../models/preferences.model')(sequelize);
    db.ActivityLog = require('../models/activitylog.model')(sequelize);
    db.ChatMessage = require('../models/chatmessage.model')(sequelize); // ADD THIS

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'AccountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'AccountId' });

    db.ActivityLog.belongsTo(db.Account, { foreignKey: 'AccountId' });
    db.Preferences.belongsTo(db.Account, { foreignKey: 'AccountId' });
    
    // ADD THESE TWO LINES
    db.ChatMessage.belongsTo(db.Account, { foreignKey: 'AccountId' });
    db.Account.hasMany(db.ChatMessage, { foreignKey: 'AccountId', onDelete: 'CASCADE' });

    await sequelize.sync({ alter: true });
}