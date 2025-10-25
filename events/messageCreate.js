const { Events, Collection } = require('discord.js');
const { CohereClient } = require('cohere-ai');
const cohere = new CohereClient({
    token: process.env.COHERE_TOKEN,
});

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const { cooldowns } = message.client;

        const triggerPhrase = "negev,";
        const messageContent = message.content.trim();

        if (messageContent.toLowerCase().startsWith(triggerPhrase)) {
            // --- COOLDOWN LOGIC START ---
            const cooldownAmount = 5 * 1000; // 5 seconds
            const now = Date.now();

            if (cooldowns.has(message.author.id)) {
                const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before I can think again.`);
                }
            }
            
            cooldowns.set(message.author.id, now);
            setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
            // --- COOLDOWN LOGIC END ---

            // Get the actual user prompt by removing the trigger phrase
            const userQuery = messageContent.substring(triggerPhrase.length).trim();

            // Show that the bot is "typing..."
            await message.channel.sendTyping();

            try {
                // --- START COHERE API LOGIC (Group Chat) ---
                const history = await message.channel.messages.fetch({ limit: 50 });
                const formattedHistory = history.reverse()
                    .filter(msg => msg.content && !msg.author.bot) // Filter out empty messages and all bots
                    .map(msg => `${msg.author.username}: ${msg.content}`) // Format as "Username: Message"
                    .join('\n'); // Join into one block
        
                const finalMessage = `${formattedHistory}\n${message.author.username}: ${userQuery}`;
        
                const response = await cohere.chat({
                    model: "command-r-08-2024",
                    message: finalMessage, 
                    preamble: process.env.NEGEV_VIBE_PROMPT, 
                });
        
                const text = response.text;
                
                // --- END COHERE API LOGIC ---
        
                await message.reply(text);
        
            } catch (replyError) {
                if (replyError.code === 50035 && replyError.rawError?.errors?.message_reference?._errors?.[0]?.code === 'MESSAGE_REFERENCE_UNKNOWN_MESSAGE') {
                    console.warn(`Original message ${message.id} not found, sending regular message instead.`);
                    await message.channel.send(`<@${message.author.id}> ${text}`);
                } else {
                    throw replyError;
                }
            }
            return; 
        }

        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;

        if (message.mentions.has(message.client.user)) {
            if (month == process.env.BMONTH_A && day == process.env.BDAY_A) {
                return message.channel.send(process.env.BDAYmedia_A);
            } else if (month == process.env.BMONTH_O && day == process.env.BDAY_O) {
                return message.channel.send(process.env.BDAYmedia_O);
            } 
        }
        if (message.mentions.has(message.client.user) && !message.reference) {
            return message.channel.send("Hi there! Use `/alerts-channel` to set up the bot.");
        }

        if (message.content.toLowerCase().includes("yomtun")) {
            message.channel.send(process.env.YOMTUN);
        }
        if (message.content.toLowerCase().includes("what do we live for")) {
            message.channel.send(process.env.HYPE_MOMENTS);
        }
    },
};