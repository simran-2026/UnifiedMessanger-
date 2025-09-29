const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// --- Event Handlers ---

// This event fires only when the bot is fully connected and ready.
client.on('ready', () => {
  // 1. Log success message
  console.log(`SUCCESS: Discord bot is ready and logged in as ${client.user.tag}!`);

  // 2. Set the bot's presence (status)
  client.user.setPresence({
    activities: [{ name: 'your messages', type: ActivityType.Watching }],
    status: 'online',
  });
});

// --- Bot Initialization ---

const startBot = async () => {
  try {
    console.log("Attempting to log in the Discord bot...");
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    // Log the full error for better debugging
    console.error("Error logging into Discord:", error);
  }
};

// Start the bot only if the token is available
if (process.env.DISCORD_BOT_TOKEN) {
    startBot();
} else {
    console.warn("DISCORD_BOT_TOKEN not found. Discord bot will not be started.");
}

// --- Exported Functions ---

const sendMessage = async (thread, text) => {
  if (!client.isReady()) {
    console.error('sendMessage failed: Discord bot is not connected or ready.');
    throw new Error('Discord bot is not connected.');
  }
  try {
    const channel = await client.channels.fetch(thread.providerThreadId);
    if (channel) {
      const message = await channel.send(text);
      return message.toJSON();
    }
    throw new Error('Discord channel not found');
  } catch (error) {
    console.error('Discord send message error:', error);
    throw new Error('Failed to send message to Discord');
  }
};

module.exports = { sendMessage, client };

