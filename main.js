const { Client, Intents } = require('discord.js')
require('dotenv').config()
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
    ]
})

const TOKEN = process.env.DISCORD_TOKEN

client.once('ready', () => {
    console.log('URSD-BOT is now online');
});
client.on("message", message => {
    if(message.content === "negev") {
        message.channel.send("oy ve")
    }
});


client.login(TOKEN)
