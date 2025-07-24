import { SlashCommandBuilder } from 'discord.js';
import brain from '../../core/brain.js';
import { getUserRole } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('conversar')
    .setDescription('Converse com a Nana diretamente'),
  async execute(interaction) {
    const userInput = interaction.options.getString('mensagem') || 'Oi Nana!';
    const role = getUserRole(interaction.user.id);
    const userMetadata = { role, username: interaction.user.username };
    const resposta = await brain.processMessage(userInput, userMetadata);
    await interaction.reply(resposta);
  }
};
