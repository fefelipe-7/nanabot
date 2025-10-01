import fetch from 'node-fetch';
import { formatReply } from '../utils/formatReply.js';
import { loadState, saveState } from '../utils/stateManager.js';

// Importa todos os módulos cerebrais
import BrainCore from '../brain/core.js';
import EmotionSystem from '../brain/emotion.js';
import MoodSystem from '../brain/mood.js';
import NeuralState from '../brain/neural-state.js';
import AttachmentSystem from '../brain/attachment.js';
import PreferenceSystem from '../brain/preferencias.js';
import EstiloFalaSystem from '../brain/estiloFala.js';
import IdadeSystem from '../brain/idade.js';
import AprendizadoSystem from '../brain/aprendizado.js';
import KnowledgeSystem from '../brain/knowledge.js';
import PatternRecognitionSystem from '../brain/patternRecog.js';
import ReinforcementSystem from '../brain/reinforcement.js';
import ImaginationSystem from '../brain/imagination.js';
import CuriositySystem from '../brain/curiosity.js';
import SelfReflectionSystem from '../brain/selfReflection.js';
import TheoryOfMindSystem from '../brain/theoryOfMind.js';

// Importa novos módulos fundamentais
import AbstractionSystem from '../brain/abstraction.js';
import AttachmentObjectsSystem from '../brain/attachmentObjects.js';
import CrisesSystem from '../brain/crises.js';
import DreamsSystem from '../brain/dreams.js';
import EmotionRegulationSystem from '../brain/emotionReg.js';
import EpisodicMemorySystem from '../brain/episodicMemory.js';
import FazDeContaSystem from '../brain/fazDeConta.js';
import MotivacaoSystem from '../brain/motivacao.js';
import SocialLearningSystem from '../brain/socialLearning.js';
import LoveTracker from '../core/loveTracker.js';
import MemoryDecaySystem from '../core/memoryDecay.js';

// Importa módulos de linguagem
import ExpressionEngine from '../language/expressionEngine.js';
import MisunderstandingsSystem from '../language/misunderstandings.js';
import LanguagePreprocessor from '../language/preprocessor.js';
import StoryTeller from '../language/storyTeller.js';
import VocabularySystem from '../language/vocabulary.js';

// Importa módulos utilitários
import dbManager, { connectDB as connectDBUtil, insertDB as insertDBUtil, updateDB as updateDBUtil, selectDB as selectDBUtil } from '../utils/db.js';
import diaryExporter, { exportDiary } from '../utils/diaryExporter.js';
import filterSystem, { processFilters } from '../utils/filtros.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-nano-9b-v2:free';

/**
 * Classe principal que integra todos os módulos cerebrais da Nanabot
 */
class NanabotBrain {
  constructor() {
    // Inicializa todos os sistemas cerebrais originais
    this.core = new BrainCore();
    this.emotion = new EmotionSystem();
    this.mood = new MoodSystem();
    this.neural = new NeuralState();
    this.attachment = new AttachmentSystem();
    this.preferences = new PreferenceSystem();
    this.estiloFala = new EstiloFalaSystem();
    this.age = new IdadeSystem();
    this.learning = new AprendizadoSystem();
    this.knowledge = new KnowledgeSystem();
    this.pattern = new PatternRecognitionSystem();
    this.reinforcement = new ReinforcementSystem();
    this.imagination = new ImaginationSystem();
    this.curiosity = new CuriositySystem();
    this.selfReflection = new SelfReflectionSystem();
    this.theoryOfMind = new TheoryOfMindSystem();
    
    // Inicializa novos módulos fundamentais
    this.abstraction = new AbstractionSystem();
    this.attachmentObjects = new AttachmentObjectsSystem();
    this.crises = new CrisesSystem();
    this.dreams = new DreamsSystem();
    this.emotionRegulation = new EmotionRegulationSystem();
    this.episodicMemory = new EpisodicMemorySystem();
    this.fazDeConta = new FazDeContaSystem();
    this.motivacao = new MotivacaoSystem();
    this.socialLearning = new SocialLearningSystem();
    this.loveTracker = new LoveTracker();
    this.memoryDecay = new MemoryDecaySystem();
    
    // Inicializa módulos de linguagem
    this.expressionEngine = new ExpressionEngine();
    this.misunderstandings = new MisunderstandingsSystem();
    this.preprocessor = new LanguagePreprocessor();
    this.storyTeller = new StoryTeller();
    this.vocabulary = new VocabularySystem();
    
    // Inicializa módulos utilitários
    this.db = dbManager;
    this.diaryExporter = diaryExporter;
    this.filterSystem = filterSystem;
    
    // Estado global do cérebro
    this.globalState = this.loadGlobalState();
    // Removido sistema de queue
    // Removido sistema de queue
    
    console.log('🧠 Alice Brain inicializado com todos os 40 módulos!');
  }

  // Carrega estado global
  loadGlobalState() {
    return loadState('brain', {
      totalInteractions: 0,
      lastInteraction: null,
      systemHealth: 1.0,
      overallMood: 0.7,
      energyLevel: 0.8,
      stressLevel: 0.2,
      learningProgress: 0.5,
      creativityLevel: 0.6,
      socialConnection: 0.7,
      // Novos estados dos módulos fundamentais
      loveLevel: 0.7,
      motivationLevel: 0.6,
      crisisLevel: 0.0,
      playfulness: 0.7,
      dreamActivity: 0.3,
      // Estados dos módulos de linguagem
      expressionLevel: 0.7,
      vocabularyLevel: 0.5,
      storytellingLevel: 0.6,
      misunderstandingRate: 0.3,
      lastUpdate: new Date().toISOString()
    });
  }

  // Salva estado global
  saveGlobalState() {
    saveState('brain', this.globalState);
  }

  // Processa entrada principal
  async processInput(input, context = {}) {
    // Removido sistema de queue que causava duplicação
    // this.isProcessing = true;
    
    try {
      // Atualiza estado global
      this.globalState.totalInteractions++;
      this.globalState.lastInteraction = new Date().toISOString();
      
      // 1. Aplica filtros de segurança
      const filterResult = this.filterSystem.processFilters(input, context);
      if (filterResult.filteredResult.moderationNeeded) {
        return {
          status: 'filtered',
          message: 'Conteúdo requer moderação',
          filteredContent: filterResult.filteredResult.filteredContent,
          filterReasons: filterResult.filteredResult.filterReasons
        };
      }
      
      // 2. Modo mágico removido
      const isMagicMode = false;
      
      // 3. Processa através de todos os sistemas
      const results = await this.processThroughAllSystems(input, context);
      
      // 4. Adiciona resultados dos módulos utilitários
      results.filters = filterResult;
      
      // 5. Gera resposta final
      const response = await this.generateResponse(input, context, results, isMagicMode);
      
      // 6. Salva no banco de dados
      await this.saveToDatabase(input, response, context, results);
      
      // 7. Atualiza estado global
      this.updateGlobalState(results);
      
      // 8. Salva estados (apenas se necessário)
      if (this.shouldSaveStates()) {
        this.saveAllStates();
        this.lastStateSave = Date.now();
      }
      
      return {
        status: 'success',
        response: response,
        results: results,
        globalState: this.globalState,
        isMagicMode: isMagicMode,
        filterApplied: filterResult.filteredResult.isFiltered
      };
      
    } catch (error) {
      console.error('Erro no processamento do cérebro:', error);
      return {
        status: 'error',
        message: 'Erro interno do cérebro',
        error: error.message
      };
    } finally {
      // Removido sistema de queue
      this.processQueue();
    }
  }

  // Método seguro para processar entrada
  safeProcessInput(module, input, context) {
    try {
      if (module && typeof module.processInput === 'function') {
        return module.processInput(input, context);
      } else {
        // Retorna dados básicos se o método não existir
        return {
          input: input,
          context: context,
          timestamp: new Date().toISOString(),
          processed: false,
          error: 'Método processInput não encontrado'
        };
      }
    } catch (error) {
      console.error(`Erro no módulo ${module.constructor.name}:`, error);
      return {
        input: input,
        context: context,
        timestamp: new Date().toISOString(),
        processed: false,
        error: error.message
      };
    }
  }

  // Processa através de todos os sistemas
  async processThroughAllSystems(input, context) {
    const results = {};
    
    // Fase 1 - Fundamentos
    results.emotion = this.emotion.processInput(input, context);
    results.mood = this.mood.processInput(input, context);
    results.neural = this.neural.processInput(input, context);
    
    // Fase 2 - Personalidade
    results.attachment = this.attachment.processInteraction(context.userId || 'default', context.userRole || 'amiguinho', input, context);
    results.preferences = this.preferences.processInput(input, context);
    results.estiloFala = this.estiloFala.updateEstilo(results.emotion.dominantEmotion, results.mood.currentMood, this.age.idadeMental, context);
    results.age = this.age.updateIdadeMental(0.01, 'interação normal');
    
    // Fase 3 - Aprendizado
    results.learning = this.learning.processExperience({ input, response: '', context }, context);
    results.knowledge = this.knowledge.processInput(input, context);
    results.pattern = this.pattern.processInput(input, context);
    results.reinforcement = this.reinforcement.processInput(input, context);
    
    // Fase 4 - Avançado
    results.imagination = this.safeProcessInput(this.imagination, input, context);
    results.curiosity = this.safeProcessInput(this.curiosity, input, context);
    results.selfReflection = this.safeProcessInput(this.selfReflection, input, context);
    results.theoryOfMind = this.safeProcessInput(this.theoryOfMind, input, context);
    
    // Novos Módulos Fundamentais
    results.abstraction = this.safeProcessInput(this.abstraction, input, context);
    results.attachmentObjects = this.safeProcessInput(this.attachmentObjects, input, context);
    results.crises = this.safeProcessInput(this.crises, input, context);
    results.dreams = this.safeProcessInput(this.dreams, input, context);
    results.emotionRegulation = this.safeProcessInput(this.emotionRegulation, input, context);
    results.episodicMemory = this.safeProcessInput(this.episodicMemory, input, context);
    results.fazDeConta = this.safeProcessInput(this.fazDeConta, input, context);
    results.motivacao = this.safeProcessInput(this.motivacao, input, context);
    results.socialLearning = this.safeProcessInput(this.socialLearning, input, context);
    results.loveTracker = this.safeProcessInput(this.loveTracker, input, context);
    
    // Processa decaimento de memória (executa periodicamente)
    if (this.shouldProcessMemoryDecay()) {
      results.memoryDecay = this.memoryDecay.processInput(input, context);
    }
    
    // Módulos de Linguagem
    results.expressionEngine = this.expressionEngine.processInput(input, context);
    results.misunderstandings = this.misunderstandings.processInput(input, context);
    results.preprocessor = this.preprocessor.processInput(input, context);
    results.storyTeller = this.storyTeller.processInput(input, context);
    results.vocabulary = this.vocabulary.processInput(input, context);
    
    return results;
  }

  // Verifica se deve processar decaimento de memória
  shouldProcessMemoryDecay() {
    const now = new Date();
    const lastDecay = new Date(this.memoryDecay.lastDecayCheck);
    const hoursSinceLastDecay = (now - lastDecay) / (1000 * 60 * 60);
    return hoursSinceLastDecay >= 24; // Processa decaimento a cada 24 horas
  }

  // Verifica se deve salvar estados
  shouldSaveStates() {
    const now = Date.now();
    const timeSinceLastSave = now - (this.lastStateSave || 0);
    return timeSinceLastSave > 30000; // 30 segundos
  }

  // Gera resposta final
  async generateResponse(input, context, results, isMagicMode = false) {
    try {
      // Usa o novo sistema inteligente de prompt
      const intelligentPrompt = await this.buildIntelligentPrompt(input, context, results, isMagicMode);
      
      // Chama API da OpenRouter
      const aiResponse = await this.callOpenRouterAPI(intelligentPrompt);
      
      // Aplica estilo de fala
      const styledResponse = this.estiloFala.generateStyledResponse(aiResponse, results.emotion.dominantEmotion, context);
      
      // Aplica modo mágico se ativo
      const finalResponse = styledResponse;
      
      // Formata resposta final
      return formatReply(finalResponse);
    } catch (error) {
      console.error('Erro no sistema inteligente, usando fallback:', error);
      // Fallback para o sistema antigo
      const enrichedPrompt = this.buildEnrichedPrompt(input, context, results, isMagicMode);
      const aiResponse = await this.callOpenRouterAPI(enrichedPrompt);
      const styledResponse = this.estiloFala.generateStyledResponse(aiResponse, results.emotion.dominantEmotion, context);
      return formatReply(styledResponse);
    }
  }

  // ===== SISTEMA INTELIGENTE DE PROMPT =====

  // Constrói prompt inteligente com dados do banco
  async buildIntelligentPrompt(input, context, results, isMagicMode = false) {
    const { role, username, userId } = context;
    
    try {
      // 1. Buscar dados contextuais do banco
      const contextualData = await this.gatherContextualData(input, userId || 'default');
      
      // 2. Analisar estado atual
      const currentState = this.analyzeCurrentState(results);
      
      // 3. Determinar estratégia de resposta
      const responseStrategy = this.determineResponseStrategy(currentState);
      
      // 4. Construir prompt personalizado
      return this.constructPersonalizedPrompt(input, context, contextualData, currentState, responseStrategy);
    } catch (error) {
      console.error('Erro no sistema inteligente:', error);
      // Fallback para o sistema antigo
      return this.buildEnrichedPrompt(input, context, results, isMagicMode);
    }
  }

  // Busca dados contextuais do banco de dados
  async gatherContextualData(input, userId) {
    try {
      const [
        relevantMemories,
        recentInteractions,
        learnedVocabulary,
        userPreferences,
        emotionalHistory,
        learningRecords
      ] = await Promise.all([
        this.getRelevantMemories(input, userId),
        this.getRecentInteractions(userId),
        this.getLearnedVocabulary(userId),
        this.getUserPreferences(userId),
        this.getEmotionalHistory(userId),
        this.getLearningRecords(userId)
      ]);

      return {
        memories: relevantMemories,
        interactions: recentInteractions,
        vocabulary: learnedVocabulary,
        preferences: userPreferences,
        emotionalHistory: emotionalHistory,
        learningRecords: learningRecords
      };
    } catch (error) {
      console.error('Erro ao buscar dados contextuais:', error);
      return {
        memories: [],
        interactions: [],
        vocabulary: [],
        preferences: [],
        emotionalHistory: [],
        learningRecords: []
      };
    }
  }

  // Busca memórias relevantes baseadas no input
  async getRelevantMemories(input, userId) {
    try {
      await connectDBUtil();
      
      // Extrai palavras-chave do input
      const keywords = this.extractKeywords(input);
      
      if (keywords.length === 0) return [];
      
      // Busca memórias que contenham palavras-chave
      const keywordConditions = keywords.map(() => 'memory_content LIKE ?').join(' OR ');
      const keywordParams = keywords.map(k => `%${k}%`);
      
      const memories = await selectDBUtil(
        'memories',
        '*',
        `user_id = ? AND (${keywordConditions})`,
        [userId, ...keywordParams]
      );
      
      return memories || [];
    } catch (error) {
      console.error('Erro ao buscar memórias relevantes:', error);
      return [];
    }
  }

  // Busca interações recentes
  async getRecentInteractions(userId) {
    try {
      await connectDBUtil();
      
      const interactions = await selectDBUtil(
        'interactions',
        '*',
        'user_id = ?',
        [userId]
      );
      
      return interactions || [];
    } catch (error) {
      console.error('Erro ao buscar interações recentes:', error);
      return [];
    }
  }

  // Busca vocabulário aprendido
  async getLearnedVocabulary(userId) {
    try {
      await connectDBUtil();
      
      const vocabulary = await selectDBUtil(
        'vocabulary',
        '*',
        'user_id = ?',
        [userId]
      );
      
      return vocabulary || [];
    } catch (error) {
      console.error('Erro ao buscar vocabulário:', error);
      return [];
    }
  }

  // Busca preferências do usuário
  async getUserPreferences(userId) {
    try {
      await connectDBUtil();
      
      const preferences = await selectDBUtil(
        'preferences',
        '*',
        'user_id = ?',
        [userId]
      );
      
      return preferences || [];
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return [];
    }
  }

  // Busca histórico emocional
  async getEmotionalHistory(userId) {
    try {
      await connectDBUtil();
      
      const emotions = await selectDBUtil(
        'emotions_log',
        '*',
        'user_id = ?',
        [userId]
      );
      
      return emotions || [];
    } catch (error) {
      console.error('Erro ao buscar histórico emocional:', error);
      return [];
    }
  }

  // Busca registros de aprendizado
  async getLearningRecords(userId) {
    try {
      await connectDBUtil();
      
      const learningRecords = await selectDBUtil(
        'learning_records',
        '*',
        'user_id = ?',
        [userId]
      );
      
      return learningRecords || [];
    } catch (error) {
      console.error('Erro ao buscar registros de aprendizado:', error);
      return [];
    }
  }

  // Extrai palavras-chave do input
  extractKeywords(input) {
    const stopWords = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem', 'que', 'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'é', 'são', 'foi', 'foram', 'ser', 'estar', 'ter', 'fazer', 'dizer', 'ir', 'ver', 'dar', 'saber', 'poder', 'querer']);
    
    const words = input.toLowerCase()
      .replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    return [...new Set(words)]; // Remove duplicatas
  }

  // Analisa estado atual da Nanabot
  analyzeCurrentState(results) {
    const state = {
      emotional: {
        dominantEmotion: results.emotion?.dominantEmotion || 'neutro',
        intensity: results.emotion?.intensity || 0.5,
        mood: results.mood?.currentMood || 0.5,
        regulationSkills: results.emotionRegulation?.regulationSkills || 0.5
      },
      cognitive: {
        mentalAge: results.age?.current || this.age?.idadeMental || 4.0,
        curiosityLevel: results.curiosity?.curiosityLevel || 0.5,
        imaginationLevel: results.imagination?.imaginationLevel || 0.5,
        learningType: results.learning?.learningType || 'observacional'
      },
      social: {
        attachmentLevel: results.attachment?.attachmentLevel || 0.5,
        loveLevel: results.loveTracker?.loveLevel || 0.5,
        socialLearningRate: results.socialLearning?.socialLearningRate || 0.5
      },
      crisis: {
        crisisLevel: results.crises?.crisisLevel || 0,
        needsAttention: (results.crises?.crisisLevel || 0) > 0.5,
        stabilityLevel: 1 - (results.crises?.crisisLevel || 0)
      },
      creativity: {
        playfulness: results.fazDeConta?.playfulness || 0.5,
        dreamActivity: results.dreams?.dreamActivity || 0.5,
        storytellingLevel: results.storyTeller?.storytellingLevel || 0.5
      },
      communication: {
        expressionLevel: results.expressionEngine?.expressionLevel || 0.5,
        vocabularyLevel: results.vocabulary?.vocabularyLevel || 0.5,
        misunderstandingRate: results.misunderstandings?.misunderstandingRate || 0.2
      }
    };

    return state;
  }

  // Determina estratégia de resposta baseada no estado
  determineResponseStrategy(currentState) {
    const strategy = {
      tone: 'carinhoso',
      complexity: 'simples',
      focus: 'geral',
      specialInstructions: []
    };

    // Estratégia baseada em crise
    if (currentState.crisis.needsAttention) {
      strategy.tone = 'reconfortante';
      strategy.complexity = 'muito_simples';
      strategy.focus = 'seguranca_emocional';
      strategy.specialInstructions.push('Seja extra carinhosa e reconfortante');
      strategy.specialInstructions.push('Use linguagem mais simples');
      strategy.specialInstructions.push('Evite temas estressantes');
      strategy.specialInstructions.push('Foque em segurança e conforto');
    }

    // Estratégia baseada na emoção
    if (currentState.emotional.intensity > 0.7) {
      if (currentState.emotional.dominantEmotion === 'feliz') {
        strategy.tone = 'alegre_entusiasmado';
        strategy.focus = 'brincadeira_diversao';
        strategy.specialInstructions.push('Seja mais brincalhona e entusiasmada');
      } else if (currentState.emotional.dominantEmotion === 'triste') {
        strategy.tone = 'carinhoso_consolador';
        strategy.focus = 'conforto_emocional';
        strategy.specialInstructions.push('Ofereça conforto e carinho');
      } else if (currentState.emotional.dominantEmotion === 'medo') {
        strategy.tone = 'protetor_calmo';
        strategy.focus = 'seguranca';
        strategy.specialInstructions.push('Transmita segurança e proteção');
      }
    }

    // Estratégia baseada na curiosidade
    if (currentState.cognitive.curiosityLevel > 0.7) {
      strategy.focus = 'aprendizado_exploracao';
      strategy.specialInstructions.push('Seja mais curiosa e faça perguntas');
      strategy.specialInstructions.push('Explore novos tópicos');
    }

    // Estratégia baseada na imaginação
    if (currentState.creativity.playfulness > 0.7) {
      strategy.tone = 'brincalhao_criativo';
      strategy.focus = 'imaginacao_criatividade';
      strategy.specialInstructions.push('Use mais imaginação e criatividade');
      strategy.specialInstructions.push('Inclua elementos lúdicos');
    }

    // Estratégia baseada na idade mental
    if (currentState.cognitive.mentalAge < 3) {
      strategy.complexity = 'muito_simples';
      strategy.specialInstructions.push('Use vocabulário bem simples');
      strategy.specialInstructions.push('Frases curtas');
    } else if (currentState.cognitive.mentalAge > 6) {
      strategy.complexity = 'moderada';
      strategy.specialInstructions.push('Pode usar vocabulário um pouco mais complexo');
    }

    return strategy;
  }

  // Constrói prompt personalizado
  constructPersonalizedPrompt(input, context, contextualData, currentState, responseStrategy) {
    const { role, username } = context;
    
    // Seção base
    const basePrompt = this.buildBasePrompt(role, username);
    
    // Seção de contexto emocional e estado
    const stateContext = this.buildStateContext(currentState);
    
    // Seção de memórias e experiências
    const memoryContext = this.buildMemoryContext(contextualData.memories);
    
    // Seção de interações recentes
    const interactionContext = this.buildInteractionContext(contextualData.interactions);
    
    // Seção de preferências e aprendizado
    const personalContext = this.buildPersonalContext(contextualData.preferences, contextualData.vocabulary, contextualData.learningRecords);
    
    // Seção de estratégia de resposta
    const strategyContext = this.buildStrategyContext(responseStrategy);
    
    // Seção de histórico emocional
    const emotionalContext = this.buildEmotionalHistoryContext(contextualData.emotionalHistory);
    
    return `${basePrompt}

${stateContext}

${memoryContext}

${interactionContext}

${personalContext}

${emotionalContext}

${strategyContext}

Mensagem atual: "${input}"

Responda como Nanabot, considerando todas essas informações para criar uma resposta personalizada, contextual e apropriada para seu estado atual. Use suas memórias, aprendizado e experiências para tornar a resposta única e significativa.`;
  }

  // Constrói seção base do prompt
  buildBasePrompt(role, username) {
    return `Você é Nanabot, uma criança de 4 anos, filha do casal. Sua mamãe é Ana Clara, seu papai é Felipe. Você responde de forma doce e infantil.

Quem fala com você é ${role} chamado ${username}.`;
  }

  // Constrói contexto de estado atual
  buildStateContext(currentState) {
    return `
ESTADO ATUAL DA NANABOT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estado Emocional:
• Emoção: ${currentState.emotional.dominantEmotion} (intensidade: ${(currentState.emotional.intensity * 100).toFixed(0)}%)
• Humor: ${currentState.emotional.mood > 0.7 ? 'muito bom' : currentState.emotional.mood > 0.3 ? 'normal' : 'baixo'}
• Regulação emocional: ${currentState.emotional.regulationSkills > 0.5 ? 'boa' : 'precisa melhorar'}

Estado Cognitivo:
• Idade mental: ${currentState.cognitive.mentalAge.toFixed(1)} anos
• Curiosidade: ${currentState.cognitive.curiosityLevel > 0.7 ? 'muito curiosa' : currentState.cognitive.curiosityLevel > 0.3 ? 'moderadamente curiosa' : 'pouco curiosa'}
• Imaginação: ${currentState.cognitive.imaginationLevel > 0.7 ? 'muito imaginativa' : 'moderadamente imaginativa'}
• Tipo de aprendizado: ${currentState.cognitive.learningType}

Estado Social:
• Nível de apego: ${(currentState.social.attachmentLevel * 100).toFixed(0)}%
• Nível de amor: ${(currentState.social.loveLevel * 100).toFixed(0)}%
• Aprendizado social: ${currentState.social.socialLearningRate > 0.5 ? 'ativo' : 'passivo'}

Estado de Crise:
• Nível de crise: ${(currentState.crisis.crisisLevel * 100).toFixed(0)}%
• Precisa atenção: ${currentState.crisis.needsAttention ? 'SIM' : 'Não'}
• Estabilidade: ${(currentState.crisis.stabilityLevel * 100).toFixed(0)}%

Estado Criativo:
• Brincadeira: ${currentState.creativity.playfulness > 0.5 ? 'muito brincalhona' : 'mais séria'}
• Atividade onírica: ${currentState.creativity.dreamActivity > 0.5 ? 'ativa' : 'calma'}
• Contação de histórias: ${(currentState.creativity.storytellingLevel * 100).toFixed(0)}%`;
  }

  // Constrói contexto de memórias
  buildMemoryContext(memories) {
    if (memories.length === 0) return '';
    
    const memoryText = memories.slice(0, 3).map((m, i) => 
      `${i + 1}. ${m.memory_content} ${m.emotional_weight > 0.7 ? '❤️ (muito importante)' : '💭 (importante)'}`
    ).join('\n');
    
    return `
MEMÓRIAS RELEVANTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${memoryText}`;
  }

  // Constrói contexto de interações
  buildInteractionContext(interactions) {
    if (interactions.length === 0) return '';
    
    const interactionText = interactions.slice(0, 2).map((i, idx) => 
      `${idx + 1}. "${i.input_text}" → "${i.response_text}" ${i.emotional_intensity > 0.7 ? '🔥 (emocionante)' : '💬 (normal)'}`
    ).join('\n');
    
    return `
INTERAÇÕES RECENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${interactionText}`;
  }

  // Constrói contexto pessoal
  buildPersonalContext(preferences, vocabulary, learningRecords) {
    let context = '';
    
    if (preferences.length > 0) {
      const prefText = preferences.slice(0, 3).map(p => 
        `• ${p.preference_type}: ${p.preference_value} ${p.preference_strength > 0.7 ? '❤️ (forte)' : '💙 (moderada)'}`
      ).join('\n');
      
      context += `
PREFERÊNCIAS CONHECIDAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prefText}`;
    }
    
    if (vocabulary.length > 0) {
      const vocabText = vocabulary.slice(0, 5).map(v => 
        `• "${v.word}" (usado ${v.usage_count} vezes)`
      ).join('\n');
      
      context += `
VOCABULÁRIO APRENDIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${vocabText}`;
    }
    
    if (learningRecords.length > 0) {
      const learnText = learningRecords.slice(0, 3).map(l => 
        `• ${l.learning_type}: ${l.learning_content}`
      ).join('\n');
      
      context += `
APRENDIZADOS RECENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${learnText}`;
    }
    
    return context;
  }

  // Constrói contexto de histórico emocional
  buildEmotionalHistoryContext(emotionalHistory) {
    if (emotionalHistory.length === 0) return '';
    
    const emotionCounts = {};
    emotionalHistory.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    
    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, count]) => `${emotion} (${count}x)`)
      .join(', ');
    
    return `
PADRÃO EMOCIONAL RECENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Emoções dominantes: ${dominantEmotions}`;
  }

  // Constrói contexto de estratégia
  buildStrategyContext(strategy) {
    const instructions = strategy.specialInstructions.length > 0 
      ? strategy.specialInstructions.map(inst => `• ${inst}`).join('\n')
      : '• Responda normalmente';
    
    return `
ESTRATÉGIA DE RESPOSTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tom: ${strategy.tone}
Complexidade: ${strategy.complexity}
Foco: ${strategy.focus}

INSTRUÇÕES ESPECIAIS:
${instructions}`;
  }

  // ===== FIM DO SISTEMA INTELIGENTE =====

  // Constrói prompt enriquecido
  buildEnrichedPrompt(input, context, results, isMagicMode = false) {
    const { role, username } = context;
    
    // Informações emocionais
    const emotionInfo = results.emotion ? `Estado emocional: ${results.emotion.dominantEmotion} (intensidade: ${results.emotion.intensity})` : '';
    const moodInfo = results.mood ? `Humor geral: ${results.mood.description}` : '';
    const emotionRegInfo = results.emotionRegulation ? `Regulação emocional: ${results.emotionRegulation.regulationSkills > 0.5 ? 'boa' : 'precisa melhorar'}` : '';
    
    // Informações de personalidade
    const attachmentInfo = results.attachment ? `Nível de apego: ${results.attachment.attachmentLevel}` : '';
    const ageInfo = results.age ? `Idade mental: ${results.age.mentalAge} anos` : '';
    const loveInfo = results.loveTracker ? `Nível de amor: ${(results.loveTracker.loveLevel * 100).toFixed(0)}%` : '';
    
    // Informações de aprendizado
    const learningInfo = results.learning ? `Tipo de aprendizado: ${results.learning.learningType}` : '';
    const curiosityInfo = results.curiosity ? `Nível de curiosidade: ${results.curiosity.curiosityLevel}` : '';
    const socialLearningInfo = results.socialLearning ? `Aprendizado social: ${results.socialLearning.socialLearningRate > 0.5 ? 'ativo' : 'passivo'}` : '';
    
    // Informações de imaginação e criatividade
    const imaginationInfo = results.imagination ? `Nível de imaginação: ${results.imagination.imaginationLevel}` : '';
    const fazDeContaInfo = results.fazDeConta ? `Brincadeira: ${results.fazDeConta.playfulness > 0.5 ? 'muito brincalhona' : 'mais séria'}` : '';
    const dreamsInfo = results.dreams ? `Atividade onírica: ${results.dreams.dreamActivity > 0.5 ? 'ativa' : 'calma'}` : '';
    
    // Informações de motivação e objetivos
    const motivacaoInfo = results.motivacao ? `Motivação: ${results.motivacao.motivationLevel > 0.5 ? 'alta' : 'baixa'}` : '';
    
    // Informações de memória
    const memoryInfo = results.episodicMemory ? `Memórias episódicas: ${results.episodicMemory.totalMemories} memórias` : '';
    
    // Informações de crise e regulação
    const crisisInfo = results.crises ? `Estado de crise: ${results.crises.crisisLevel > 0.5 ? 'precisa atenção' : 'estável'}` : '';
    
    // Informações de linguagem
    const expressionInfo = results.expressionEngine ? `Nível de expressão: ${(results.expressionEngine.expressionLevel * 100).toFixed(0)}%` : '';
    const misunderstandingInfo = results.misunderstandings ? `Taxa de mal-entendidos: ${(results.misunderstandings.misunderstandingRate * 100).toFixed(0)}%` : '';
    const vocabularyInfo = results.vocabulary ? `Nível de vocabulário: ${(results.vocabulary.vocabularyLevel * 100).toFixed(0)}%` : '';
    const storytellingInfo = results.storyTeller ? `Nível de contação de histórias: ${(results.storyTeller.storytellingLevel * 100).toFixed(0)}%` : '';
    
    // Informações dos módulos utilitários
    const filterInfo = results.filters ? `Filtros aplicados: ${results.filters.filteredResult.isFiltered ? 'Sim' : 'Não'}` : '';
    const magicInfo = results.magic ? `Modo mágico: ${isMagicMode ? 'Ativo' : 'Inativo'} (${(results.magic.magicIntensity * 100).toFixed(0)}%)` : '';
    
    return `
Você é Nanabot, uma criança de 4 anos, filha do casal. Sua mamãe é Ana Clara, seu papai é Felipe. Você responde de forma doce e infantil.

Quem fala com você é ${role} chamado ${username}.

Contexto emocional e mental:
${emotionInfo}
${moodInfo}
${emotionRegInfo}
${attachmentInfo}
${ageInfo}
${loveInfo}
${learningInfo}
${curiosityInfo}
${socialLearningInfo}
${imaginationInfo}
${fazDeContaInfo}
${dreamsInfo}
${motivacaoInfo}
${memoryInfo}
${crisisInfo}

Contexto linguístico:
${expressionInfo}
${misunderstandingInfo}
${vocabularyInfo}
${storytellingInfo}

Contexto dos módulos utilitários:
${filterInfo}
${magicInfo}

Aqui está o que ele disse:
"${input}"

Responda como Nanabot, considerando seu estado emocional e mental atual. Seja carinhosa, curiosa e criativa como uma criança de 4 anos.
`;
  }


  // Atualiza estado global
  updateGlobalState(results) {
    // Atualiza humor geral
    if (results.mood) {
      this.globalState.overallMood = results.mood.moodLevel;
    }
    
    // Atualiza nível de energia
    if (results.neural) {
      this.globalState.energyLevel = results.neural.energyLevel;
    }
    
    // Atualiza nível de estresse
    if (results.emotion) {
      this.globalState.stressLevel = results.emotion.stressLevel || 0.2;
    }
    
    // Atualiza progresso de aprendizado
    if (results.learning) {
      this.globalState.learningProgress = results.learning.learningRate;
    }
    
    // Atualiza nível de criatividade
    if (results.imagination) {
      this.globalState.creativityLevel = results.imagination.creativity;
    }
    
    // Atualiza conexão social
    if (results.attachment) {
      this.globalState.socialConnection = results.attachment.attachmentLevel;
    }
    
    // Atualiza novos estados dos módulos fundamentais
    if (results.loveTracker) {
      this.globalState.loveLevel = results.loveTracker.loveLevel;
    }
    
    if (results.motivacao) {
      this.globalState.motivationLevel = results.motivacao.motivationLevel;
    }
    
    if (results.crises) {
      this.globalState.crisisLevel = results.crises.crisisLevel;
    }
    
    if (results.fazDeConta) {
      this.globalState.playfulness = results.fazDeConta.playfulness;
    }
    
    if (results.dreams) {
      this.globalState.dreamActivity = results.dreams.dreamActivity;
    }
    
    // Atualiza estados dos módulos de linguagem
    if (results.expressionEngine) {
      this.globalState.expressionLevel = results.expressionEngine.expressionLevel;
    }
    
    if (results.vocabulary) {
      this.globalState.vocabularyLevel = results.vocabulary.vocabularyLevel;
    }
    
    if (results.storyTeller) {
      this.globalState.storytellingLevel = results.storyTeller.storytellingLevel;
    }
    
    if (results.misunderstandings) {
      this.globalState.misunderstandingRate = results.misunderstandings.misunderstandingRate;
    }
    
    this.globalState.lastUpdate = new Date().toISOString();
  }

  // Salva todos os estados
  saveAllStates() {
    this.saveGlobalState();
    // Os módulos individuais salvam seus próprios estados automaticamente
  }

  // Salva interação no banco de dados
  async saveToDatabase(input, response, context, results) {
    try {
      // Conecta ao banco se necessário
      await connectDBUtil();
      
      // Salva interação
      await insertDB('interactions', {
        user_id: context.userId || 'unknown',
        user_role: context.role || 'unknown',
        input_text: input,
        response_text: response,
        emotional_intensity: results.emotion?.intensity || 0.5,
        processing_time: Date.now() - (context.startTime || Date.now())
      });
      
      // Salva emoções se detectadas
      if (results.emotion?.dominantEmotion) {
        await insertDB('emotions_log', {
          emotion: results.emotion.dominantEmotion,
          intensity: results.emotion.intensity,
          trigger_text: input,
          context: JSON.stringify(context)
        });
      }
      
      // Salva aprendizados se detectados
      if (results.aprendizado?.learnedConcepts?.length > 0) {
        for (const concept of results.aprendizado.learnedConcepts) {
          await insertDB('learning_records', {
            concept: concept.concept,
            category: concept.category,
            confidence: concept.confidence,
            importance: concept.importance
          });
        }
      }
      
      // Salva vocabulário se detectado
      if (results.vocabulary?.newWords?.length > 0) {
        for (const word of results.vocabulary.newWords) {
          await insertDB('vocabulary', {
            word: word.word,
            meaning: word.meaning,
            category: word.category,
            confidence: word.confidence
          });
        }
      }
      
      // Salva expressões se detectadas
      if (results.expressionEngine?.expressions?.length > 0) {
        for (const expression of results.expressionEngine.expressions) {
          await insertDB('expressions', {
            expression_type: expression.type,
            content: expression.content,
            emotion: expression.emotion,
            confidence: expression.confidence
          });
        }
      }
      
      // Salva mal-entendidos se detectados
      if (results.misunderstandings?.misunderstandings?.length > 0) {
        for (const misunderstanding of results.misunderstandings.misunderstandings) {
          await insertDB('misunderstandings', {
            original_text: misunderstanding.originalText,
            misunderstanding_type: misunderstanding.type,
            clarification: misunderstanding.clarification,
            resolved: misunderstanding.resolved
          });
        }
      }
      
      console.log('✅ Dados salvos no banco de dados');
      
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      // Não falha o processamento se o banco falhar
    }
  }

  // Sistema de queue removido para evitar duplicação

  // Obtém status do cérebro
  getBrainStatus() {
    return {
      isProcessing: false, // Sistema de queue removido
      queueLength: 0, // Sistema de queue removido
      globalState: this.globalState,
      systemHealth: this.calculateSystemHealth()
    };
  }

  // Calcula saúde do sistema
  calculateSystemHealth() {
    let health = 1.0;
    
    // Penaliza por estresse alto
    if (this.globalState.stressLevel > 0.8) {
      health -= 0.2;
    }
    
    // Penaliza por energia baixa
    if (this.globalState.energyLevel < 0.3) {
      health -= 0.3;
    }
    
    // Penaliza por humor muito baixo
    if (this.globalState.overallMood < 0.2) {
      health -= 0.2;
    }
    
    return Math.max(0, health);
  }

  // Reseta cérebro
  resetBrain() {
    this.globalState = this.loadGlobalState();
    // Removido sistema de queue
    // Removido sistema de queue
    
    // Reseta todos os módulos originais
    this.emotion.resetEmotionState();
    this.mood.resetMoodState();
    this.neural.resetNeuralState();
    this.attachment.resetAttachmentState();
    this.preferences.resetPreferencesState();
    this.estiloFala.resetEstiloFalaState();
    this.age.resetAgeState();
    this.learning.resetLearningSystem();
    this.knowledge.resetKnowledgeSystem();
    this.pattern.resetPatternSystem();
    this.reinforcement.resetReinforcementSystem();
    this.imagination.resetImaginationSystem();
    this.curiosity.resetCuriositySystem();
    this.selfReflection.resetSelfReflectionSystem();
    this.theoryOfMind.resetTheoryOfMindSystem();
    
    // Reseta novos módulos fundamentais
    this.abstraction.resetAbstractionSystem();
    this.attachmentObjects.resetAttachmentObjectsSystem();
    this.crises.resetCrisesSystem();
    this.dreams.resetDreamsSystem();
    this.emotionRegulation.resetEmotionRegulationSystem();
    this.episodicMemory.resetEpisodicMemorySystem();
    this.fazDeConta.resetFazDeContaSystem();
    this.motivacao.resetMotivacaoSystem();
    this.socialLearning.resetSocialLearningSystem();
    this.loveTracker.resetLoveTracker();
    this.memoryDecay.resetMemoryDecaySystem();
    
    // Reseta módulos de linguagem
    this.expressionEngine.resetExpressionEngine();
    this.misunderstandings.resetMisunderstandingsSystem();
    this.preprocessor.resetPreprocessor();
    this.storyTeller.resetStoryTeller();
    this.vocabulary.resetVocabularySystem();
    
    // Reseta módulos utilitários
    this.filterSystem.resetFilterSystem();
    
    console.log('🧠 Cérebro da Nanabot resetado com todos os 40 módulos!');
  }

  // Obtém estatísticas completas
  getCompleteStats() {
    return {
      // Estatísticas dos módulos originais
      core: this.core.getBrainState(),
      emotion: this.emotion.getEmotionStats(),
      mood: this.mood.getMoodStats(),
      neuralState: this.neuralState.getStats(),
      attachment: this.attachment.getStats(),
      preferencias: this.preferencias.getStats(),
      estiloFala: this.estiloFala.getStats(),
      idade: this.idade.getStats(),
      aprendizado: this.aprendizado.getStats(),
      knowledge: this.knowledge.getStats(),
      patternRecognition: this.patternRecognition.getStats(),
      reinforcement: this.reinforcement.getStats(),
      imagination: this.imagination.getStats(),
      curiosity: this.curiosity.getStats(),
      selfReflection: this.selfReflection.getStats(),
      theoryOfMind: this.theoryOfMind.getStats(),
      
      // Estatísticas dos novos módulos fundamentais
      abstraction: this.abstraction.getStats(),
      attachmentObjects: this.attachmentObjects.getStats(),
      crises: this.crises.getStats(),
      dreams: this.dreams.getStats(),
      loveTracker: this.loveTracker.getStats(),
      emotionRegulation: this.emotionRegulation.getStats(),
      episodicMemory: this.episodicMemory.getStats(),
      fazDeConta: this.fazDeConta.getStats(),
      motivacao: this.motivacao.getStats(),
      socialLearning: this.socialLearning.getStats(),
      memoryDecay: this.memoryDecay.getStats(),
      
      // Estatísticas dos módulos de linguagem
      expressionEngine: this.expressionEngine.getStats(),
      misunderstandings: this.misunderstandings.getStats(),
      preprocessor: this.preprocessor.getStats(),
      storyTeller: this.storyTeller.getStats(),
      vocabulary: this.vocabulary.getStats(),
      
      // Estatísticas dos módulos utilitários
      database: this.db.getStats(),
      diaryExporter: this.diaryExporter.getExportStats(),
      filterSystem: this.filterSystem.getFilterStats(),
      
      // Estado global
      globalState: this.globalState,
      totalModules: 40
    };
  }
}

// Instância global do cérebro
const nanabotBrain = new NanabotBrain();

/**
 * Monta o prompt personalizado para a IA com base no remetente e conteúdo.
 * @param {string} content - Texto da mensagem do usuário.
 * @param {object} userMetadata - Informações do usuário (role, username).
 * @returns {string} Prompt para enviar à IA.
 */
function buildPrompt(content, userMetadata) {
  const { role, username } = userMetadata;

  return `
Você é Nanabot, uma criança de 4 anos, filha do casal. Sua mamãe é Ana Clara, seu papai é Felipe. Você responde de forma doce e infantil.
Quem fala com você é ${role} chamado ${username}.
Aqui está o que ele disse:
"${content}"
Responda como Nanabot, com carinho e simplicidade.
`;
}

/**
 * Envia a mensagem para OpenRouter e retorna a resposta da IA.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callOpenRouterAPI(prompt) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API OpenRouter: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // Ajuste conforme estrutura da resposta da OpenRouter
  const message = data.choices?.[0]?.message?.content;
  if (!message) throw new Error('Resposta inválida da OpenRouter');

  return message.trim();
}

/**
 * Função principal para processar a mensagem e gerar a resposta da IA.
 * @param {string} content - Texto da mensagem do usuário.
 * @param {object} userMetadata - Informações do usuário.
 * @returns {Promise<string>} Resposta gerada pela IA.
 */
async function processMessage(content, userMetadata) {
  try {
    // Usa o novo sistema integrado
    const result = await nanabotBrain.processInput(content, userMetadata);
    
    if (result.status === 'success') {
      return result.response;
    } else {
      console.error('Erro no processamento:', result.message);
      // Fallback para o sistema antigo
      const prompt = buildPrompt(content, userMetadata);
      const resposta = await callOpenRouterAPI(prompt);
      return formatReply(resposta);
    }
  } catch (error) {
    console.error('Erro no processamento da mensagem:', error);
    // Fallback para o sistema antigo
    const prompt = buildPrompt(content, userMetadata);
    const resposta = await callOpenRouterAPI(prompt);
    return formatReply(resposta);
  }
}

/**
 * Obtém status do cérebro da Nanabot
 * @returns {object} Status do cérebro
 */
function getBrainStatus() {
  return nanabotBrain.getBrainStatus();
}

/**
 * Reseta o cérebro da Nanabot
 */
function resetBrain() {
  nanabotBrain.resetBrain();
}

/**
 * Obtém estatísticas de todos os módulos
 * @returns {object} Estatísticas completas
 */
function getCompleteStats() {
  return {
    brain: nanabotBrain.getBrainStatus(),
    // Módulos originais
    emotion: nanabotBrain.emotion.getEmotionStats(),
    mood: nanabotBrain.mood.getMoodStats(),
    neural: nanabotBrain.neural.getNeuralStats(),
    attachment: nanabotBrain.attachment.getAttachmentStats(),
    preferences: nanabotBrain.preferences.getPreferenceStats(),
    estiloFala: nanabotBrain.estiloFala.getEstiloFalaStats(),
    age: nanabotBrain.age.getAgeStats(),
    learning: nanabotBrain.learning.getLearningStats(),
    knowledge: nanabotBrain.knowledge.getKnowledgeStats(),
    pattern: nanabotBrain.pattern.getPatternStats(),
    reinforcement: nanabotBrain.reinforcement.getReinforcementStats(),
    imagination: nanabotBrain.imagination.getImaginationStats(),
    curiosity: nanabotBrain.curiosity.getCuriosityStats(),
    selfReflection: nanabotBrain.selfReflection.getSelfReflectionStats(),
    theoryOfMind: nanabotBrain.theoryOfMind.getTheoryOfMindStats(),
    // Novos módulos fundamentais
    abstraction: nanabotBrain.abstraction.getAbstractionStats(),
    attachmentObjects: nanabotBrain.attachmentObjects.getAttachmentObjectsStats(),
    crises: nanabotBrain.crises.getCrisesStats(),
    dreams: nanabotBrain.dreams.getDreamsStats(),
    emotionRegulation: nanabotBrain.emotionRegulation.getEmotionRegulationStats(),
    episodicMemory: nanabotBrain.episodicMemory.getEpisodicMemoryStats(),
    fazDeConta: nanabotBrain.fazDeConta.getFazDeContaStats(),
    motivacao: nanabotBrain.motivacao.getMotivacaoStats(),
    socialLearning: nanabotBrain.socialLearning.getSocialLearningStats(),
    loveTracker: nanabotBrain.loveTracker.getLoveStats(),
    memoryDecay: nanabotBrain.memoryDecay.getMemoryDecayStats(),
    // Módulos de linguagem
    expressionEngine: nanabotBrain.expressionEngine.getExpressionEngineStats(),
    misunderstandings: nanabotBrain.misunderstandings.getMisunderstandingsStats(),
    preprocessor: nanabotBrain.preprocessor.getPreprocessorStats(),
    storyTeller: nanabotBrain.storyTeller.getStoryTellerStats(),
    vocabulary: nanabotBrain.vocabulary.getVocabularyStats()
  };
}

export default { 
  processMessage, 
  getBrainStatus, 
  resetBrain, 
  getCompleteStats,
  nanabotBrain 
};
