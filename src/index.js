import dotenv from 'dotenv';
dotenv.config();
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js';
import keepAliveSystem from './utils/keepAlive.js';
import dataCleanupSystem from './utils/dataCleanup.js';

// Criação do cliente do Discord com intents necessários
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// === SISTEMA DE COMANDOS UNIFICADO n![comando] ===
// Slash commands desativados - usando apenas n![comando]

import commandRouter from './utils/commandRouter.js';

// Carrega comandos unificados para o sistema n!
const commandsPath = path.resolve('./src/commands');
const commandItems = fs.readdirSync(commandsPath);
for (const item of commandItems) {
  const itemPath = path.join(commandsPath, item);
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    const subFiles = fs.readdirSync(itemPath).filter(f => f.endsWith('.js'));
    for (const subFile of subFiles) {
      const subFilePath = path.join(itemPath, subFile);
      try {
        const command = (await import('file://' + path.resolve(subFilePath))).default;
        if ('commandName' in command && 'execute' in command) {
          commandRouter.registerCommand(command.commandName, command);
        }
      } catch (err) {
        logger.error(`Erro ao importar comando unificado (${subFilePath}): ${err.message}`);
      }
    }
  } else if (item.endsWith('.js')) {
    try {
      const command = (await import('file://' + path.resolve(itemPath))).default;
      if ('commandName' in command && 'execute' in command) {
        commandRouter.registerCommand(command.commandName, command);
      }
    } catch (err) {
      logger.error(`Erro ao importar comando unificado (${itemPath}): ${err.message}`);
    }
  }
}

console.log(`[INIT] 🎯 Sistema de comandos unificado carregado com ${commandRouter.commands.size} comandos`);

// === Carregar eventos (arquivos .js) ===
const eventsPath = path.resolve('./src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = (await import('file://' + path.resolve(filePath))).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  } catch (err) {
    logger.error(`Erro ao importar evento (${filePath}): ${err.message}`);
  }
}

// === Iniciar o bot ===
client.login(process.env.DISCORD_TOKEN);

// === Inicializar Keep-Alive System e Data Cleanup ===
// Aguarda o bot estar pronto antes de iniciar os sistemas
client.once('ready', () => {
  // Inicia sistemas após 30 segundos para garantir que tudo esteja funcionando
  setTimeout(() => {
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('[BOT] 🔄 Iniciando sistema de keep-alive...');
      keepAliveSystem.start();
      
      console.log('[BOT] 🧹 Iniciando sistema de limpeza de dados...');
      dataCleanupSystem.start();
    } else {
      console.log('[BOT] 🏠 Ambiente de desenvolvimento - sistemas desabilitados');
    }
  }, 30000); // 30 segundos
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[BOT] 🛑 SIGTERM recebido, encerrando bot...');
  keepAliveSystem.stop();
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[BOT] 🛑 SIGINT recebido, encerrando bot...');
  keepAliveSystem.stop();
  client.destroy();
  process.exit(0);
});
