// src/commands/help.js - Comando unificado n!help
import { formatReply } from '../utils/formatReply.js';
import commandRouter from '../utils/commandRouter.js';
import { EmbedBuilder } from 'discord.js';

export default {
  commandName: 'help',
  description: 'Mostra todos os comandos disponíveis da Alice',
  category: 'sistema',
  aliases: ['ajuda', 'comandos', 'commands'],
  
  async execute(message, client) {
    console.log(`[HELP-COMMAND] 📚 Executando comando help para ${message.author.username}`);
    
    try {
      const commands = commandRouter.getAvailableCommands();
      const stats = commandRouter.getStats();
      
      // Agrupa comandos por categoria
      const categories = {};
      commands.forEach(cmd => {
        if (!categories[cmd.category]) {
          categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
      });
      
      const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('🎯 Comandos da Alicezinha')
        .setDescription('Lista completa de todos os comandos disponíveis')
        .addFields(
          { name: '📊 Total de Comandos', value: commands.length.toString(), inline: true },
          { name: '⚡ Execuções Totais', value: (stats.totalExecutions || 0).toString(), inline: true },
          { name: '✅ Taxa de Sucesso', value: `${stats.successRate || 0}%`, inline: true }
        )
        .setTimestamp();

      // Adiciona comandos por categoria
      Object.entries(categories).forEach(([category, cmds]) => {
        const categoryEmoji = {
          'sistema': '⚙️',
          'historias': '📚',
          'afeto': '💕',
          'admin': '🔒',
          'utilitarios': '🔧',
          'geral': '📝'
        }[category] || '📝';
        
        let categoryText = '';
        cmds.forEach(cmd => {
          const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.slice(0, 2).join(', ')})` : '';
          categoryText += `• \`n!${cmd.name}\`${aliases}\n`;
        });
        
        embed.addFields({
          name: `${categoryEmoji} ${category.toUpperCase()}`,
          value: categoryText || 'Nenhum comando',
          inline: true
        });
      });

      // Adiciona informações de uso
      embed.addFields({
        name: '💡 Como Usar',
        value: '• `n![comando]` - Executa comando\n• `@Alice [mensagem]` - Conversa com IA\n• `n!help` - Mostra esta ajuda',
        inline: false
      });

      embed.setFooter({ 
        text: '✨ Alice está sempre pronta para ajudar!' 
      });

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(`[HELP-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Ops! Tive um probleminha ao mostrar a ajuda... 😅'));
    }
  }
};
