// database/models/guild.js
const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    // You can add your chattyChannelIds here later
});

module.exports = mongoose.model('Guild', guildSchema);