const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('URSD-BOT is now online');
});
client.on("message", message => {
    if(message.content === "ursd") {
        message.channel.send("forever")
    }
});


client.login("sample token")
