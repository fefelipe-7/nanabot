// This file handles the love message event
// It listens for messages and reacts with a heart emoji

// Import necessary modules
import { Client, GatewayIntentBits } from 'discord.js';

// ...other event handlers...

export default {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    // Exemplo: reage com um emoji de coração se a mensagem contém "amo"
    if (message.author.bot) return;
    if (/amo|amor|carinho/i.test(message.content)) {
      await message.react('❤️');
    }
  }
};
