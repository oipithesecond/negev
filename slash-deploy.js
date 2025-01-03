const { REST, Routes, SlashCommandBuilder } = require("discord.js")
require('dotenv').config();

const botID = "894614880877948968"
const serverID = "894591665757626399"
const botToken = process.env.DISCORD_TOKEN

const rest = new REST().setToken(botToken)
const slashRegister = async() => {
    try{
        await rest.put(Routes.applicationCommands(botID), { 
            body: [
                new SlashCommandBuilder()
                .setName("ping")
                .setDescription("ping me to see what's up"),

                new SlashCommandBuilder()
                .setName("alerts-channel")
                .setDescription("specify the channel for the bot to send alerts in")
                .addChannelOption(option => 
                    option
                        .setName("channel")
                        .setDescription("The channel to send alerts in")
                        .setRequired(true)
                )
                .toJSON(),
            ]
        })
    }catch(error){
        console.error(error)
    }
}

slashRegister()

