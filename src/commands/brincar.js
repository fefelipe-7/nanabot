import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('brincar')
    .setDescription('A Nana quer brincar com você!'),
  async execute(interaction) {
    await interaction.reply('Vamos brincar de faz de conta? Eu adoro inventar mundos! 🧸');
  }
};
