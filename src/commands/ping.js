import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong! para testar se a Nana está online'),
  async execute(interaction) {
    await interaction.reply('Pong! 🏓');
  }
};
