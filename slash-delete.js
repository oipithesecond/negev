const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        const guildId = '894591665757626399'; 
        console.log('Fetching and deleting guild commands...');

        // Fetch all guild commands
        const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId));

        for (const command of guildCommands) {
            await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, guildId, command.id));
            console.log(`Deleted guild command: ${command.name}`);
        }

        console.log('All guild commands deleted for guild:', guildId);
    } catch (error) {
        console.error('Error deleting guild commands:', error);
    }
})();
