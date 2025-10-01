// src/commands/fantasia.js - Comando unificado n!fantasia
import { formatReply } from '../utils/formatReply.js';
import modeManager from '../modules/modeManager.js';
import storyTeller from '../modules/storyTeller.js';
import emotionBase from '../modules/emotionBase.js';
import fs from 'fs';
import path from 'path';

export default {
  commandName: 'fantasia',
  description: 'A Alice cria cenários de faz de conta interativos (modo 2-3 turnos)',
  category: 'historias',
  aliases: ['faz-de-conta', 'fazdeconta', 'fantasy', 'brincadeira'],
  
  async execute(message, client) {
    console.log(`[FANTASIA-COMMAND] 🎭 Executando comando fantasia para ${message.author.username}`);
    
    try {
      const guildId = message.guild?.id || 'dm';
      const channelId = message.channel.id;
      const userId = message.author.id;
      
      // Carrega configuração
      const config = this.loadCommandConfig();
      
      // Verifica se está aguardando slot-filling
      const waitingForSlot = await modeManager.isWaitingForSlotFilling(guildId, channelId, userId);
      
      if (waitingForSlot) {
        console.log(`[FANTASIA-COMMAND] 📝 Processando resposta do slot-filling`);
        await this.processSlotFillingResponse(message, waitingForSlot, config);
        return;
      }
      
      // Verifica se já está em modo fantasia
      const existingMode = await modeManager.isInMode(guildId, channelId, userId, 'fantasy');
      
      if (existingMode.active) {
        console.log(`[FANTASIA-COMMAND] 🎭 Já está em modo fantasia, continuando`);
        await this.continueFantasyMode(message, existingMode, config);
        return;
      }
      
      // Inicia modo fantasia
      await this.startFantasyMode(message, config);
      
    } catch (error) {
      console.error(`[FANTASIA-COMMAND] 💥 Erro:`, error.message);
      await message.reply(formatReply('Vamos brincar de faz de conta! Que aventura você quer viver? 🎪✨'));
    }
  },

  // Carrega configuração do comando
  loadCommandConfig() {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'commands.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.commands.fantasia || {};
    } catch (error) {
      console.error('[FANTASIA-COMMAND] Erro ao carregar config:', error.message);
      return {};
    }
  },

  // Inicia modo fantasia
  async startFantasyMode(message, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const modeConfig = config.mode || {};
    const maxTurns = modeConfig.maxTurns || 3;
    const ttl = modeConfig.ttl || 300; // 5 minutos
    
    // Seleciona cenário
    const scenarios = modeConfig.scenarios || [
      "Vamos fingir que estamos em um castelo gigante e você é o rei!",
      "Eu sou uma astronauta e você tem que pilotar a nave comigo!",
      "Vamos brincar que somos super-heróis salvando o mundo!",
      "Que tal fingirmos que estamos numa floresta mágica?"
    ];
    
    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Estado inicial do modo
    const stateData = {
      scenario: selectedScenario,
      turn: 1,
      maxTurns: maxTurns,
      userResponses: [],
      startTime: Date.now()
    };
    
    const modeStarted = await modeManager.startMode(guildId, channelId, userId, 'fantasy', stateData, ttl);
    
    if (!modeStarted) {
      console.log(`[FANTASIA-COMMAND] ❌ Falha ao iniciar modo fantasia`);
      await message.reply(formatReply('Vamos brincar de faz de conta! Que aventura você quer viver? 🎪✨'));
      return;
    }
    
    // Gera primeira pergunta
    const questions = modeConfig.questions || [
      "O que você quer fazer primeiro?",
      "Como você quer que nossa aventura continue?",
      "Que poder especial você tem?"
    ];
    
    const firstQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    // Aplica variação emocional
    const finalScenario = emotionBase.applyEmotionVariation(selectedScenario, 'high');
    const finalQuestion = emotionBase.applyEmotionVariation(firstQuestion, 'high');
    
    const response = `${finalScenario}\n\n${finalQuestion}`;
    
    await message.reply(formatReply(response));
    console.log(`[FANTASIA-COMMAND] ✅ Modo fantasia iniciado (TTL: ${ttl}s, Turno: 1/${maxTurns})`);
  },

  // Continua modo fantasia
  async continueFantasyMode(message, modeInfo, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const state = modeInfo.state;
    const userResponse = message.content.trim();
    
    // Adiciona resposta do usuário
    state.userResponses.push(userResponse);
    state.turn++;
    
    // Verifica se atingiu limite de turnos
    if (state.turn > state.maxTurns) {
      console.log(`[FANTASIA-COMMAND] 🏁 Modo fantasia finalizado (limite de turnos atingido)`);
      await this.endFantasyMode(message, state, config);
      return;
    }
    
    // Atualiza estado
    await modeManager.updateModeState(guildId, channelId, userId, state);
    
    // Gera próxima pergunta baseada na resposta
    const nextQuestion = this.generateNextQuestion(state, userResponse, config);
    
    // Aplica variação emocional
    const finalQuestion = emotionBase.applyEmotionVariation(nextQuestion, 'high');
    
    await message.reply(formatReply(finalQuestion));
    console.log(`[FANTASIA-COMMAND] 📝 Turno ${state.turn}/${state.maxTurns} processado`);
  },

  // Processa resposta do slot-filling
  async processSlotFillingResponse(message, slotInfo, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    const userResponse = message.content.trim();
    
    // Processa resposta
    const processedState = await modeManager.processSlotFillingResponse(
      guildId, 
      channelId, 
      userId, 
      userResponse
    );
    
    if (processedState) {
      console.log(`[FANTASIA-COMMAND] 📝 Resposta processada: "${userResponse}"`);
      
      // Inicia modo fantasia com contexto
      await this.startFantasyModeWithContext(message, userResponse, config);
    } else {
      await this.startFantasyMode(message, config);
    }
  },

  // Inicia modo fantasia com contexto
  async startFantasyModeWithContext(message, userResponse, config) {
    // Determina se deve usar IA
    const useAI = config.useAI && await this.isAIAvailable();
    
    // Gera cenário baseado na resposta
    const scenario = await storyTeller.generateFantasyScenario(userResponse, useAI);
    
    // Aplica variação emocional
    const finalScenario = emotionBase.applyEmotionVariation(scenario, 'high');
    
    await message.reply(formatReply(finalScenario));
    console.log(`[FANTASIA-COMMAND] ✅ Cenário com contexto gerado`);
  },

  // Gera próxima pergunta
  generateNextQuestion(state, userResponse, config) {
    const questions = config.mode?.questions || [
      "O que você quer fazer primeiro?",
      "Como você quer que nossa aventura continue?",
      "Que poder especial você tem?",
      "Onde você quer ir agora?",
      "Que personagem você quer ser?"
    ];
    
    // Seleciona pergunta baseada no turno e resposta
    let question;
    
    if (state.turn === 2) {
      question = "Que poder especial você tem?";
    } else if (state.turn === 3) {
      question = "Como você quer que nossa aventura termine?";
    } else {
      question = questions[Math.floor(Math.random() * questions.length)];
    }
    
    return question;
  },

  // Finaliza modo fantasia
  async endFantasyMode(message, state, config) {
    const guildId = message.guild?.id || 'dm';
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    // Finaliza modo
    await modeManager.endMode(guildId, channelId, userId, 'completed');
    
    // Gera conclusão
    const conclusion = this.generateConclusion(state);
    
    // Aplica variação emocional
    const finalConclusion = emotionBase.applyEmotionVariation(conclusion, 'high');
    
    await message.reply(formatReply(finalConclusion));
    console.log(`[FANTASIA-COMMAND] 🎉 Modo fantasia finalizado com sucesso`);
  },

  // Gera conclusão do modo fantasia
  generateConclusion(state) {
    const conclusions = [
      "Que aventura incrível! Você foi um herói fantástico! 🦸‍♀️✨",
      "Nossa brincadeira foi tão divertida! Você é muito criativo! 🎭🌟",
      "Que faz de conta legal! Você tem uma imaginação incrível! 🧚‍♀️💫",
      "Foi uma aventura mágica! Você é um ótimo parceiro de brincadeira! 🏰🎪"
    ];
    
    return conclusions[Math.floor(Math.random() * conclusions.length)];
  },

  // Verifica se IA está disponível
  async isAIAvailable() {
    try {
      const apiRotator = await import('../utils/apiRotator.js');
      const stats = apiRotator.default.getStats();
      return stats.activeModels > 0;
    } catch (error) {
      return false;
    }
  }
};
