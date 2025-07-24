import { SlashCommandBuilder } from 'discord.js';
import { getIdadeFormatada } from '../core/growth.js';

export default {
  data: new SlashCommandBuilder()
    .setName('idade')
    .setDescription('Mostra a idade mental da Nana de forma carinhosa'),
  async execute(interaction) {
    const idade = getIdadeFormatada();
    await interaction.reply(idade);
  }
};
