import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('falar')
    .setDescription('A Nana fala algo carinhoso!'),
  async execute(interaction) {
    await interaction.reply('Você sabia que eu te amo até a lua e voltar? 🌙');
  }
};
