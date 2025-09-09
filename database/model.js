const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    guildName: { type: String, required: true },
    channelId: { type: String, required: true },
    channelName: { type: String, required: true },
    spotifyPlaylistId: { type: String, default: null },
    voteThreshold: { type: Number, default: 2 }
});

module.exports = mongoose.model('Guild', guildSchema);