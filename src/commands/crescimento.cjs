import { SlashCommandBuilder } from 'discord.js';
import { getResumoCrescimento } from '../core/growth.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crescimento')
    .setDescription('Mostra um resumo afetivo do crescimento da Nana'),
  async execute(interaction) {
    const resumo = getResumoCrescimento();
    await interaction.reply(resumo);
  }
};
