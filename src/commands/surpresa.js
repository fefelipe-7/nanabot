import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('surpresa')
    .setDescription('A Nana faz uma surpresa!'),
  async execute(interaction) {
    await interaction.reply('Uau! Eu trouxe uma surpresa: você ganhou um abraço de estrelinha! ✨');
  }
};
