// src/utils/commandRouter.js - Roteador de Comandos Unificado n![comando]
import { formatReply } from './formatReply.js';

class CommandRouter {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      commandUsage: new Map()
    };
  }

  // Registra um comando
  registerCommand(commandName, command) {
    this.commands.set(commandName, command);
    
    // Registra aliases se existirem
    if (command.aliases && Array.isArray(command.aliases)) {
      command.aliases.forEach(alias => {
        this.aliases.set(alias, commandName);
      });
    }
    
    console.log(`[COMMAND-ROUTER] ✅ Comando registrado: n!${commandName}`);
  }

  // Executa um comando
  async executeCommand(commandName, message, client) {
    try {
      this.stats.totalExecutions++;
      console.log(`[COMMAND-ROUTER] 🚀 EXECUTANDO COMANDO: n!${commandName} por ${message.author.username}`);
      
      // Verifica se é um alias
      const actualCommandName = this.aliases.get(commandName) || commandName;
      const command = this.commands.get(actualCommandName);
      
      if (!command) {
        console.log(`[COMMAND-ROUTER] ❌ COMANDO NÃO ENCONTRADO: n!${commandName}`);
        await message.reply(formatReply(`Desculpa, não conheço o comando "n!${commandName}". Digite "n!help" para ver todos os comandos! 😊`));
        return false;
      }

      console.log(`[COMMAND-ROUTER] 📋 COMANDO ENCONTRADO: ${actualCommandName} (categoria: ${command.category || 'geral'})`);

      // Verifica permissões se necessário
      if (command.permissions && !this.checkPermissions(message, command.permissions)) {
        console.log(`[COMMAND-ROUTER] 🚫 PERMISSÃO NEGADA para ${message.author.username}`);
        await message.reply(formatReply('Você não tem permissão para usar esse comando! 😅'));
        return false;
      }

      console.log(`[COMMAND-ROUTER] ⚡ EXECUTANDO FUNÇÃO do comando: ${actualCommandName}`);
      
      // Executa o comando
      await command.execute(message, client);
      
      this.stats.successfulExecutions++;
      this.stats.commandUsage.set(actualCommandName, (this.stats.commandUsage.get(actualCommandName) || 0) + 1);
      
      console.log(`[COMMAND-ROUTER] ✅ COMANDO EXECUTADO COM SUCESSO: n!${actualCommandName} por ${message.author.username}`);
      return true;
      
    } catch (error) {
      this.stats.failedExecutions++;
      console.error(`[COMMAND-ROUTER] 💥 ERRO AO EXECUTAR COMANDO n!${commandName}:`, error);
      
      await message.reply(formatReply('Ops! Algo deu errado com esse comando. Tenta de novo! 😅'));
      return false;
    }
  }

  // Verifica permissões
  checkPermissions(message, requiredPermissions) {
    // Implementar lógica de permissões se necessário
    return true; // Por enquanto, todos podem usar todos os comandos
  }

  // Lista todos os comandos disponíveis
  getAvailableCommands() {
    const commands = [];
    
    for (const [name, command] of this.commands) {
      commands.push({
        name: name,
        description: command.description || 'Sem descrição',
        aliases: command.aliases || [],
        category: command.category || 'geral'
      });
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Obtém estatísticas
  getStats() {
    return {
      ...this.stats,
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size,
      successRate: this.stats.totalExecutions > 0 ? 
        (this.stats.successfulExecutions / this.stats.totalExecutions * 100).toFixed(1) + '%' : '0%'
    };
  }

  // Processa mensagem e extrai comando
  parseCommand(content) {
    // Remove o prefixo n! e extrai comando e argumentos
    const withoutPrefix = content.slice(2).trim();
    const parts = withoutPrefix.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    return {
      commandName,
      args,
      fullContent: withoutPrefix
    };
  }
}

export default new CommandRouter();
