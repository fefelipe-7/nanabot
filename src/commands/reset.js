// src/commands/reset.js - Comando para resetar o cérebro da Alice
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import brainModule from '../core/brain.js';
const { resetBrain } = brainModule;

const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('Reseta o cérebro da Alice (apenas para administradores)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(option =>
    option
      .setName('confirmacao')
      .setDescription('Digite "CONFIRMAR" para resetar')
      .setRequired(true)
  );

async function execute(interaction) {
  const confirmacao = interaction.options.getString('confirmacao');
  
  if (confirmacao !== 'CONFIRMAR') {
    await interaction.reply('❌ Confirmação incorreta. Digite "CONFIRMAR" para resetar o cérebro.');
    return;
  }
  
  try {
    await interaction.deferReply();
    
    // Reseta o cérebro
    resetBrain();
    
    await interaction.editReply('🧠 **Cérebro da Alice resetado com sucesso!**\n\n' +
      'Todos os sistemas foram reinicializados:\n' +
      '✅ Emoções\n' +
      '✅ Humor\n' +
      '✅ Apego\n' +
      '✅ Aprendizado\n' +
      '✅ Imaginação\n' +
      '✅ Curiosidade\n' +
      '✅ Auto-reflexão\n' +
      '✅ Teoria da mente\n\n' +
      'A Alice voltou ao estado inicial! 🎉');
      
  } catch (error) {
    console.error('Erro ao resetar cérebro:', error);
    await interaction.editReply('❌ Erro ao resetar o cérebro: ' + error.message);
  }
}

export default { data, execute };
