import { SlashCommandBuilder } from 'discord.js';
import { getMarcos } from '../core/growth.js';

export default {
  data: new SlashCommandBuilder()
    .setName('marcos')
    .setDescription('Lista os marcos de crescimento mais importantes da Nana'),
  async execute(interaction) {
    const marcos = getMarcos();
    if (!marcos.length) {
      await interaction.reply('Ainda não vivi nenhum marco importante...');
      return;
    }
    const texto = marcos.map(m => `• ${new Date(m.data).toLocaleDateString('pt-BR')}: ${m.descricao} (${m.impacto}, ${m.tipo})`).join('\n');
    await interaction.reply(`Meus marcos mais importantes:\n${texto}`);
  }
};
