import { Events } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Comando não encontrado: ${interaction.commandName}`);
        return;
      }

      await command.execute(interaction);
    } catch (error) {
      logger.error(`Erro ao executar o comando: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Oops! Algo deu errado ao executar esse comando 💥',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'Desculpa, tive um errinho ao tentar responder 😓',
          ephemeral: true,
        });
      }
    }
  },
};
