// This file contains the command for the abracar action
import { SlashCommandBuilder } from 'discord.js';
import { formatReply } from '../utils/formatReply.js';
export default {
  data: new SlashCommandBuilder()
    .setName('abracar')
    .setDescription('A Nana te dá um abraço carinhoso!'),
  async execute(interaction) {
    await interaction.reply(formatReply('Vem cá, deixa eu te dar um abraço bem apertado! 🤗'));
  }
};
