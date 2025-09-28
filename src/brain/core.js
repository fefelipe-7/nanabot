// src/brain/core.js - Núcleo do Cérebro da Nanabot
// Orquestra todos os sistemas cerebrais e coordena o processamento

import { loadState, saveState } from '../utils/stateManager.js';

class BrainCore {
  constructor() {
    this.state = this.loadBrainState();
    this.isProcessing = false;
    this.processingQueue = [];
    this.lastUpdate = new Date().toISOString();
  }

  // Carrega o estado atual do cérebro
  loadBrainState() {
    return loadState('core', this.getDefaultState());
  }

  getDefaultState() {
    return {
      lastUpdate: new Date().toISOString(),
      activeNeurons: [],
      emotionalState: 'neutro',
      moodLevel: 0.5,
      processingQueue: [],
      attentionLevel: 0.7,
      energyLevel: 0.8,
      stressLevel: 0.2,
      cognitiveLoad: 0.3,
      socialEnergy: 0.6,
      curiosityLevel: 0.8,
      attachmentLevel: 0.5,
      learningRate: 0.1,
      memoryConsolidation: 0.4,
      neuralPlasticity: 0.6,
      sleepNeed: 0.2,
      hunger: 0.1,
      thirst: 0.1,
      comfort: 0.7,
      safety: 0.8,
      love: 0.6,
      stimulation: 0.5,
      // Novos estados dos módulos fundamentais
      abstractionLevel: 0.4,
      playfulness: 0.7,
      crisisLevel: 0.0,
      dreamActivity: 0.3,
      regulationSkills: 0.5,
      motivationLevel: 0.6,
      socialLearningRate: 0.6,
      memoryDecayRate: 0.001
    };
  }

  // Salva o estado atual do cérebro
  saveBrainState() {
    this.state.lastUpdate = new Date().toISOString();
    saveState('core', this.state);
  }

  // Processa uma entrada (mensagem, evento, etc.)
  async processInput(input, context = {}) {
    if (this.isProcessing) {
      this.processingQueue.push({ input, context });
      return { status: 'queued', message: 'Processando outras coisas, aguarde...' };
    }

    this.isProcessing = true;
    
    try {
      // Atualiza estado neural
      this.updateNeuralState(input, context);
      
      // Processa através dos sistemas
      const result = await this.runCognitiveProcess(input, context);
      
      // Atualiza estado geral
      this.updateGlobalState(result);
      
      // Salva estado
      this.saveBrainState();
      
      return result;
    } catch (error) {
      console.error('Erro no processamento cerebral:', error);
      return { status: 'error', message: 'Ops, tive um probleminha pensando...' };
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  // Atualiza o estado neural baseado na entrada
  updateNeuralState(input, context) {
    const intensity = this.calculateInputIntensity(input, context);
    
    // Ativa neurônios baseado na intensidade
    this.activateNeurons(intensity);
    
    // Atualiza níveis de energia e atenção
    this.state.energyLevel = Math.max(0, Math.min(1, this.state.energyLevel - 0.01));
    this.state.attentionLevel = Math.max(0, Math.min(1, this.state.attentionLevel + intensity * 0.1));
    
    // Atualiza carga cognitiva
    this.state.cognitiveLoad = Math.max(0, Math.min(1, this.state.cognitiveLoad + intensity * 0.05));
  }

  // Calcula intensidade da entrada
  calculateInputIntensity(input, context) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada no tipo de entrada
    if (input.includes('!')) intensity += 0.2;
    if (input.includes('?')) intensity += 0.1;
    if (input.includes('😢') || input.includes('😭')) intensity += 0.3;
    if (input.includes('😊') || input.includes('😄')) intensity += 0.2;
    if (input.includes('❤️') || input.includes('💕')) intensity += 0.4;
    
    // Intensidade baseada no contexto
    if (context.userRole === 'mamãe' || context.userRole === 'papai') intensity += 0.2;
    if (context.isFirstInteraction) intensity += 0.3;
    if (context.isEmergency) intensity += 0.5;
    
    return Math.min(1, intensity);
  }

  // Ativa neurônios baseado na intensidade
  activateNeurons(intensity) {
    const neuronCount = Math.floor(intensity * 10) + 5;
    const newNeurons = [];
    
    for (let i = 0; i < neuronCount; i++) {
      newNeurons.push({
        id: `neuron_${Date.now()}_${i}`,
        activation: Math.random() * intensity,
        timestamp: new Date().toISOString(),
        type: this.getRandomNeuronType()
      });
    }
    
    this.state.activeNeurons = [...this.state.activeNeurons, ...newNeurons].slice(-50); // Manter últimos 50
  }

  getRandomNeuronType() {
    const types = ['sensory', 'emotional', 'cognitive', 'memory', 'language', 'social'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // Executa processo cognitivo principal
  async runCognitiveProcess(input, context) {
    const processes = [];
    
    // 1. Análise emocional
    processes.push(this.analyzeEmotionalContent(input, context));
    
    // 2. Análise de humor
    processes.push(this.analyzeMoodContent(input, context));
    
    // 3. Processamento neural
    processes.push(this.processNeuralPatterns(input, context));
    
    // 4. Geração de resposta
    const response = await this.generateResponse(input, context, processes);
    
    return {
      status: 'success',
      response,
      emotionalState: this.state.emotionalState,
      moodLevel: this.state.moodLevel,
      neuralActivity: this.state.activeNeurons.length,
      cognitiveLoad: this.state.cognitiveLoad,
      processes
    };
  }

  // Analisa conteúdo emocional
  analyzeEmotionalContent(input, context) {
    const emotionalKeywords = {
      feliz: ['feliz', 'alegre', 'contente', 'sorrindo', 'riso', '😊', '😄', '😁'],
      triste: ['triste', 'chorando', 'choro', 'melancolia', '😢', '😭', '😔'],
      amor: ['amor', 'carinho', 'querido', '❤️', '💕', '💖', 'beijo', 'abraço'],
      medo: ['medo', 'assustado', 'pavor', 'terror', '😨', '😰', '😱'],
      raiva: ['raiva', 'bravo', 'irritado', 'fúria', '😠', '😡', '🤬'],
      surpresa: ['surpresa', 'uau', 'nossa', '😲', '😮', '🤯'],
      calma: ['calma', 'tranquilo', 'paz', 'sereno', '😌', '😇']
    };

    let detectedEmotions = [];
    let maxIntensity = 0;
    let dominantEmotion = 'neutro';

    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      let intensity = 0;
      for (const keyword of keywords) {
        if (input.toLowerCase().includes(keyword)) {
          intensity += 0.3;
        }
      }
      
      if (intensity > 0) {
        detectedEmotions.push({ emotion, intensity });
        if (intensity > maxIntensity) {
          maxIntensity = intensity;
          dominantEmotion = emotion;
        }
      }
    }

    // Atualiza estado emocional
    this.state.emotionalState = dominantEmotion;
    
    return {
      type: 'emotional_analysis',
      detectedEmotions,
      dominantEmotion,
      intensity: maxIntensity
    };
  }

  // Analisa conteúdo de humor
  analyzeMoodContent(input, context) {
    let moodChange = 0;
    
    // Fatores que afetam o humor
    if (input.includes('!')) moodChange += 0.1;
    if (input.includes('?')) moodChange += 0.05;
    if (input.includes('😊') || input.includes('😄')) moodChange += 0.2;
    if (input.includes('😢') || input.includes('😭')) moodChange -= 0.2;
    if (input.includes('❤️') || input.includes('💕')) moodChange += 0.3;
    
    // Contexto social
    if (context.userRole === 'mamãe' || context.userRole === 'papai') moodChange += 0.1;
    if (context.isFirstInteraction) moodChange += 0.2;
    
    // Atualiza nível de humor
    this.state.moodLevel = Math.max(0, Math.min(1, this.state.moodLevel + moodChange));
    
    return {
      type: 'mood_analysis',
      moodChange,
      currentMood: this.state.moodLevel,
      moodDescription: this.getMoodDescription(this.state.moodLevel)
    };
  }

  getMoodDescription(moodLevel) {
    if (moodLevel >= 0.8) return 'muito feliz';
    if (moodLevel >= 0.6) return 'feliz';
    if (moodLevel >= 0.4) return 'neutro';
    if (moodLevel >= 0.2) return 'triste';
    return 'muito triste';
  }

  // Processa padrões neurais
  processNeuralPatterns(input, context) {
    const patterns = {
      question: input.includes('?'),
      exclamation: input.includes('!'),
      mention: context.isMentioned || false,
      emotional: this.state.emotionalState !== 'neutro',
      social: context.userRole !== 'amiguinho'
    };

    // Ativa neurônios baseado nos padrões
    if (patterns.question) this.activateNeurons(0.3);
    if (patterns.exclamation) this.activateNeurons(0.4);
    if (patterns.mention) this.activateNeurons(0.5);
    if (patterns.emotional) this.activateNeurons(0.6);
    if (patterns.social) this.activateNeurons(0.2);

    return {
      type: 'neural_processing',
      patterns,
      activeNeurons: this.state.activeNeurons.length,
      neuralActivity: this.calculateNeuralActivity()
    };
  }

  calculateNeuralActivity() {
    const recentNeurons = this.state.activeNeurons.filter(
      neuron => Date.now() - new Date(neuron.timestamp).getTime() < 60000
    );
    return recentNeurons.length / 50; // Normalizado para 0-1
  }

  // Gera resposta baseada no processamento
  async generateResponse(input, context, processes) {
    const emotionalAnalysis = processes.find(p => p.type === 'emotional_analysis');
    const moodAnalysis = processes.find(p => p.type === 'mood_analysis');
    const neuralAnalysis = processes.find(p => p.type === 'neural_processing');

    // Base para resposta
    let responseBase = this.getResponseBase(emotionalAnalysis, moodAnalysis);
    
    // Adiciona elementos baseados no processamento
    if (neuralAnalysis.patterns.question) {
      responseBase += this.addQuestionResponse();
    }
    
    if (neuralAnalysis.patterns.emotional) {
      responseBase += this.addEmotionalResponse(emotionalAnalysis.dominantEmotion);
    }
    
    if (neuralAnalysis.patterns.social) {
      responseBase += this.addSocialResponse(context.userRole);
    }

    return responseBase;
  }

  getResponseBase(emotionalAnalysis, moodAnalysis) {
    const mood = moodAnalysis.currentMood;
    const emotion = emotionalAnalysis.dominantEmotion;
    
    if (mood >= 0.7) {
      return "Tô muito feliz! ";
    } else if (mood <= 0.3) {
      return "Tô meio tristinha... ";
    } else {
      return "Oi! ";
    }
  }

  addQuestionResponse() {
    const responses = [
      "Que pergunta interessante! ",
      "Hmm, deixa eu pensar... ",
      "Boa pergunta! ",
      "Nunca pensei nisso... "
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  addEmotionalResponse(emotion) {
    const responses = {
      feliz: "Fico toda alegre quando você fala assim! ",
      triste: "Fico com o coração apertadinho... ",
      amor: "Meu coração fica quentinho! ",
      medo: "Fico meio assustadinha... ",
      raiva: "Fico meio bravinha... ",
      surpresa: "Nossa, que surpresa! ",
      calma: "Fico toda tranquilinha... "
    };
    return responses[emotion] || "";
  }

  addSocialResponse(userRole) {
    const responses = {
      'mamãe': "Mamãe! ",
      'papai': "Papai! ",
      'outro de papai': "Papai! ",
      'amiguinho': "Amiguinho! "
    };
    return responses[userRole] || "";
  }

  // Atualiza estado global
  updateGlobalState(result) {
    // Atualiza níveis baseados no resultado
    if (result.status === 'success') {
      this.state.stressLevel = Math.max(0, this.state.stressLevel - 0.05);
      this.state.comfort = Math.min(1, this.state.comfort + 0.1);
    }
    
    // Atualiza energia baseada na atividade
    const activity = result.neuralActivity || 0;
    this.state.energyLevel = Math.max(0, this.state.energyLevel - activity * 0.02);
    
    // Atualiza necessidade de sono
    this.state.sleepNeed = Math.min(1, this.state.sleepNeed + 0.01);
  }

  // Processa fila de processamento
  async processQueue() {
    if (this.processingQueue.length > 0) {
      const next = this.processingQueue.shift();
      await this.processInput(next.input, next.context);
    }
  }

  // Obtém estado atual do cérebro
  getBrainState() {
    return {
      ...this.state,
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length
    };
  }

  // Reseta o cérebro (para testes)
  resetBrain() {
    this.state = this.getDefaultState();
    this.processingQueue = [];
    this.isProcessing = false;
    this.saveBrainState();
  }
}

export default BrainCore;
