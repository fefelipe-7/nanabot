import dotenv from 'dotenv';
dotenv.config();
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js';

// Criação do cliente do Discord com intents necessários
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// === Carregar comandos (/comandos) ===
const commandsPath = path.join('./src/commands');
let commandFolders = [];
try {
  commandFolders = fs.readdirSync(commandsPath);
} catch (err) {
  logger.error(`Erro ao ler a pasta de comandos: ${err.message}`);
}

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  let commandFiles = [];
  try {
    commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  } catch (err) {
    logger.error(`Erro ao ler a pasta de comandos (${folderPath}): ${err.message}`);
    continue;
  }

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    try {
      const command = (await import(filePath)).default;
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        logger.warn(`[AVISO] O comando em ${filePath} está incompleto.`);
      }
    } catch (err) {
      logger.error(`Erro ao importar comando (${filePath}): ${err.message}`);
    }
  }
}

// === Carregar eventos (ready, interactionCreate, messageCreate) ===
const eventsPath = path.join('./src/events');
let eventFiles = [];
try {
  eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
} catch (err) {
  logger.error(`Erro ao ler a pasta de eventos: ${err.message}`);
}

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = (await import(filePath)).default;
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
