// src/events/messageCreate.js
import { Events } from 'discord.js';
import brain from '../core/brain.js';
import { getUserRole } from '../utils/helpers.js';

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return; // Ignorar mensagens de bots

    // Verifica se o bot foi mencionado na mensagem
    if (!message.mentions.has(client.user)) return;

    // Remove a menção do texto para pegar só o que a pessoa escreveu
    const content = message.content.replace(/<@!?(\d+)>/, '').trim();

    // Identifica o papel do usuário (mamãe, papai, etc)
    const role = getUserRole(message.author.id);

    // Monta o contexto para a IA
    const userMetadata = {
      role,
      username: message.author.username,
    };

    try {
      // Envia o texto para o módulo brain (que chama a IA)
      const resposta = await brain.processMessage(content, userMetadata);

      // Responde no canal com a resposta da IA
      await message.reply(resposta);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      await message.reply('Ops, tive um probleminha tentando responder... 😢');
    }
  },
};
