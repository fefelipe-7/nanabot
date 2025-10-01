// src/commands/help.js - Comando unificado n!help
import { formatReply } from '../utils/formatReply.js';
import commandRouter from '../utils/commandRouter.js';

export default {
  commandName: 'help',
  description: 'Mostra todos os comandos disponíveis da Alice',
  category: 'sistema',
  aliases: ['ajuda', 'comandos', 'commands'],
  
  async execute(message, client) {
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
    
    let helpText = '🎯 **Comandos da Alicezinha**\n\n';
    helpText += `📊 **Total:** ${commands.length} comandos | **Execuções:** ${stats.totalExecutions}\n\n`;
    
    // Lista comandos por categoria
    Object.entries(categories).forEach(([category, cmds]) => {
      const categoryEmoji = {
        'sistema': '⚙️',
        'personalidade': '🎭',
        'utilidade': '🔧',
        'monitoramento': '📊',
        'geral': '📝'
      }[category] || '📝';
      
      helpText += `${categoryEmoji} **${category.toUpperCase()}**\n`;
      
      cmds.forEach(cmd => {
        const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        helpText += `  • \`n!${cmd.name}\`${aliases} - ${cmd.description}\n`;
      });
      
      helpText += '\n';
    });
    
    helpText += '💡 **Como usar:**\n';
    helpText += '• `n![comando]` - Executa comando\n';
    helpText += '• `@Alice [mensagem]` - Conversa com IA\n';
    helpText += '• `n!help` - Mostra esta ajuda\n\n';
    helpText += '✨ **Alice está sempre pronta para ajudar!**';
    
    // Discord tem limite de 2000 caracteres
    if (helpText.length > 1900) {
      helpText = helpText.substring(0, 1900) + '\n... *(lista truncada)*';
    }
    
    await message.reply(formatReply(helpText));
  }
};
