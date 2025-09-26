// src/brain/neural-state.js - Simulação de Atividade Neural da Nanabot
// Simula atividade neural, plasticidade sináptica e processamento de informações

import fs from 'fs';
import path from 'path';

class NeuralState {
  constructor() {
    this.neurons = new Map();
    this.synapses = new Map();
    this.neuralNetworks = new Map();
    this.activeNeurons = new Set();
    this.neuralActivity = 0;
    this.plasticity = 0.6; // Plasticidade sináptica
    this.learningRate = 0.1;
    this.decayRate = 0.95; // Taxa de decaimento da ativação
    this.threshold = 0.5; // Limiar de ativação
    this.maxConnections = 1000;
    this.lastUpdate = new Date().toISOString();
    this.neuralHistory = [];
    
    this.initializeNeuralNetworks();
  }

  // Inicializa redes neurais básicas
  initializeNeuralNetworks() {
    // Rede emocional
    this.createNeuralNetwork('emotional', {
      input: ['sensory_input', 'context_input'],
      hidden: ['emotion_processing', 'mood_regulation'],
      output: ['emotional_response', 'mood_change']
    });

    // Rede de linguagem
    this.createNeuralNetwork('language', {
      input: ['text_input', 'tone_input'],
      hidden: ['semantic_processing', 'syntactic_analysis'],
      output: ['language_response', 'emotional_tone']
    });

    // Rede social
    this.createNeuralNetwork('social', {
      input: ['user_identity', 'social_context'],
      hidden: ['relationship_processing', 'social_cues'],
      output: ['social_response', 'attachment_level']
    });

    // Rede de memória
    this.createNeuralNetwork('memory', {
      input: ['experience_input', 'context_input'],
      hidden: ['memory_encoding', 'memory_retrieval'],
      output: ['memory_storage', 'memory_recall']
    });
  }

  // Cria uma rede neural
  createNeuralNetwork(name, structure) {
    const network = {
      name,
      layers: {
        input: structure.input || [],
        hidden: structure.hidden || [],
        output: structure.output || []
      },
      connections: new Map(),
      weights: new Map(),
      activations: new Map(),
      lastActivity: 0
    };

    // Cria neurônios para cada camada
    [...structure.input, ...structure.hidden, ...structure.output].forEach(neuronId => {
      this.createNeuron(neuronId, {
        type: this.getNeuronType(neuronId),
        network: name,
        layer: this.getNeuronLayer(neuronId, structure)
      });
    });

    // Cria conexões entre camadas
    this.createNetworkConnections(network);
    
    this.neuralNetworks.set(name, network);
  }

  // Cria um neurônio
  createNeuron(id, properties = {}) {
    const neuron = {
      id,
      type: properties.type || 'standard',
      network: properties.network || 'default',
      layer: properties.layer || 'hidden',
      activation: 0,
      threshold: this.threshold,
      bias: Math.random() * 0.2 - 0.1,
      lastFired: 0,
      fireCount: 0,
      connections: new Set(),
      properties: {
        plasticity: this.plasticity,
        learningRate: this.learningRate,
        ...properties
      }
    };

    this.neurons.set(id, neuron);
    return neuron;
  }

  // Determina tipo do neurônio baseado no ID
  getNeuronType(neuronId) {
    if (neuronId.includes('sensory')) return 'sensory';
    if (neuronId.includes('emotion')) return 'emotional';
    if (neuronId.includes('language')) return 'language';
    if (neuronId.includes('memory')) return 'memory';
    if (neuronId.includes('social')) return 'social';
    if (neuronId.includes('output')) return 'output';
    if (neuronId.includes('input')) return 'input';
    return 'standard';
  }

  // Determina camada do neurônio
  getNeuronLayer(neuronId, structure) {
    if (structure.input.includes(neuronId)) return 'input';
    if (structure.output.includes(neuronId)) return 'output';
    return 'hidden';
  }

  // Cria conexões na rede neural
  createNetworkConnections(network) {
    const { input, hidden, output } = network.layers;
    
    // Conexões input -> hidden
    input.forEach(inputNeuron => {
      hidden.forEach(hiddenNeuron => {
        this.createSynapse(inputNeuron, hiddenNeuron, Math.random() * 0.4 - 0.2);
      });
    });

    // Conexões hidden -> output
    hidden.forEach(hiddenNeuron => {
      output.forEach(outputNeuron => {
        this.createSynapse(hiddenNeuron, outputNeuron, Math.random() * 0.4 - 0.2);
      });
    });

    // Conexões hidden -> hidden (recurrent)
    hidden.forEach(hiddenNeuron1 => {
      hidden.forEach(hiddenNeuron2 => {
        if (hiddenNeuron1 !== hiddenNeuron2) {
          this.createSynapse(hiddenNeuron1, hiddenNeuron2, Math.random() * 0.2 - 0.1);
        }
      });
    });
  }

  // Cria uma sinapse entre dois neurônios
  createSynapse(fromNeuronId, toNeuronId, weight = 0) {
    const synapseId = `${fromNeuronId}_to_${toNeuronId}`;
    
    const synapse = {
      id: synapseId,
      from: fromNeuronId,
      to: toNeuronId,
      weight: weight,
      strength: Math.abs(weight),
      lastUsed: 0,
      useCount: 0,
      plasticity: this.plasticity
    };

    this.synapses.set(synapseId, synapse);
    
    // Adiciona conexão aos neurônios
    const fromNeuron = this.neurons.get(fromNeuronId);
    const toNeuron = this.neurons.get(toNeuronId);
    
    if (fromNeuron) fromNeuron.connections.add(synapseId);
    if (toNeuron) toNeuron.connections.add(synapseId);

    return synapse;
  }

  // Processa entrada através da rede neural
  processInput(input, context = {}) {
    const startTime = Date.now();
    this.lastUpdate = new Date().toISOString();
    
    // Ativa neurônios de entrada
    this.activateInputNeurons(input, context);
    
    // Propaga ativação através da rede
    this.propagateActivation();
    
    // Coleta saídas
    const outputs = this.collectOutputs();
    
    // Atualiza plasticidade
    this.updatePlasticity();
    
    // Registra atividade
    this.recordNeuralActivity(startTime, input, outputs);
    
    return {
      outputs,
      neuralActivity: this.calculateNeuralActivity(),
      activeNeurons: this.activeNeurons.size,
      processingTime: Date.now() - startTime
    };
  }

  // Ativa neurônios de entrada
  activateInputNeurons(input, context) {
    // Ativa neurônios sensoriais
    this.activateNeuron('sensory_input', this.calculateSensoryInput(input));
    
    // Ativa neurônios de contexto
    this.activateNeuron('context_input', this.calculateContextInput(context));
    
    // Ativa neurônios de texto
    this.activateNeuron('text_input', this.calculateTextInput(input));
    
    // Ativa neurônios sociais
    this.activateNeuron('user_identity', this.calculateUserIdentity(context));
    
    // Ativa neurônios de experiência
    this.activateNeuron('experience_input', this.calculateExperienceInput(input, context));
  }

  // Calcula entrada sensorial
  calculateSensoryInput(input) {
    let intensity = 0.1; // Base
    
    // Intensidade baseada em características do texto
    if (input.includes('!')) intensity += 0.2;
    if (input.includes('?')) intensity += 0.1;
    if (input.includes('😊') || input.includes('😄')) intensity += 0.3;
    if (input.includes('😢') || input.includes('😭')) intensity += 0.3;
    if (input.includes('❤️') || input.includes('💕')) intensity += 0.4;
    
    return Math.min(1, intensity);
  }

  // Calcula entrada contextual
  calculateContextInput(context) {
    let intensity = 0.1; // Base
    
    if (context.userRole === 'mamãe' || context.userRole === 'papai') intensity += 0.3;
    if (context.isFirstInteraction) intensity += 0.2;
    if (context.isEmergency) intensity += 0.4;
    if (context.isMentioned) intensity += 0.2;
    
    return Math.min(1, intensity);
  }

  // Calcula entrada de texto
  calculateTextInput(input) {
    const length = input.length;
    const complexity = this.calculateTextComplexity(input);
    
    return Math.min(1, (length / 100) * 0.5 + complexity * 0.5);
  }

  // Calcula complexidade do texto
  calculateTextComplexity(input) {
    const words = input.split(' ').length;
    const sentences = input.split(/[.!?]+/).length;
    const punctuation = (input.match(/[.!?,;:]/g) || []).length;
    
    return Math.min(1, (words / 20) * 0.4 + (sentences / 5) * 0.3 + (punctuation / 10) * 0.3);
  }

  // Calcula identidade do usuário
  calculateUserIdentity(context) {
    const identityMap = {
      'mamãe': 0.9,
      'papai': 0.9,
      'outro de papai': 0.8,
      'amiguinho': 0.5
    };
    
    return identityMap[context.userRole] || 0.3;
  }

  // Calcula entrada de experiência
  calculateExperienceInput(input, context) {
    // Baseado na familiaridade com o tipo de entrada
    let familiarity = 0.5; // Base
    
    // Aumenta familiaridade com interações similares
    if (this.neuralHistory.length > 0) {
      const recent = this.neuralHistory.slice(-10);
      const similarInputs = recent.filter(entry => 
        this.calculateSimilarity(input, entry.input) > 0.7
      );
      familiarity += similarInputs.length * 0.1;
    }
    
    return Math.min(1, familiarity);
  }

  // Calcula similaridade entre duas entradas
  calculateSimilarity(input1, input2) {
    const words1 = input1.toLowerCase().split(' ');
    const words2 = input2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  // Ativa um neurônio
  activateNeuron(neuronId, activation) {
    const neuron = this.neurons.get(neuronId);
    if (!neuron) return;
    
    neuron.activation = Math.max(0, Math.min(1, activation));
    neuron.lastFired = Date.now();
    
    if (neuron.activation >= neuron.threshold) {
      neuron.fireCount++;
      this.activeNeurons.add(neuronId);
    }
  }

  // Propaga ativação através da rede
  propagateActivation() {
    const maxIterations = 10;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      let changed = false;
      
      for (const [neuronId, neuron] of this.neurons) {
        if (neuron.layer === 'input') continue;
        
        const newActivation = this.calculateNeuronActivation(neuron);
        
        if (Math.abs(newActivation - neuron.activation) > 0.01) {
          neuron.activation = newActivation;
          changed = true;
          
          if (neuron.activation >= neuron.threshold) {
            this.activeNeurons.add(neuronId);
          }
        }
      }
      
      if (!changed) break;
      iteration++;
    }
  }

  // Calcula ativação de um neurônio
  calculateNeuronActivation(neuron) {
    let totalInput = neuron.bias;
    
    for (const synapseId of neuron.connections) {
      const synapse = this.synapses.get(synapseId);
      if (!synapse || synapse.to !== neuron.id) continue;
      
      const fromNeuron = this.neurons.get(synapse.from);
      if (!fromNeuron) continue;
      
      totalInput += fromNeuron.activation * synapse.weight;
    }
    
    // Função de ativação sigmóide
    return 1 / (1 + Math.exp(-totalInput));
  }

  // Coleta saídas da rede
  collectOutputs() {
    const outputs = {};
    
    for (const [networkName, network] of this.neuralNetworks) {
      outputs[networkName] = {};
      
      for (const outputNeuronId of network.layers.output) {
        const neuron = this.neurons.get(outputNeuronId);
        if (neuron) {
          outputs[networkName][outputNeuronId] = neuron.activation;
        }
      }
    }
    
    return outputs;
  }

  // Atualiza plasticidade sináptica
  updatePlasticity() {
    for (const [synapseId, synapse] of this.synapses) {
      const fromNeuron = this.neurons.get(synapse.from);
      const toNeuron = this.neurons.get(synapse.to);
      
      if (!fromNeuron || !toNeuron) continue;
      
      // Regra de Hebb: neurônios que disparam juntos se conectam mais fortemente
      if (fromNeuron.activation > 0.5 && toNeuron.activation > 0.5) {
        synapse.weight += this.learningRate * synapse.plasticity;
        synapse.useCount++;
      } else if (fromNeuron.activation < 0.3 && toNeuron.activation > 0.7) {
        // Inibição competitiva
        synapse.weight -= this.learningRate * synapse.plasticity * 0.5;
      }
      
      // Limita peso
      synapse.weight = Math.max(-1, Math.min(1, synapse.weight));
      
      // Atualiza força da sinapse
      synapse.strength = Math.abs(synapse.weight);
    }
  }

  // Calcula atividade neural geral
  calculateNeuralActivity() {
    let totalActivity = 0;
    let activeCount = 0;
    
    for (const [neuronId, neuron] of this.neurons) {
      totalActivity += neuron.activation;
      if (neuron.activation > 0.1) activeCount++;
    }
    
    this.neuralActivity = totalActivity / this.neurons.size;
    return this.neuralActivity;
  }

  // Registra atividade neural
  recordNeuralActivity(startTime, input, outputs) {
    const activity = {
      timestamp: new Date().toISOString(),
      input: input.substring(0, 100), // Limita tamanho
      outputs: this.summarizeOutputs(outputs),
      neuralActivity: this.neuralActivity,
      activeNeurons: this.activeNeurons.size,
      processingTime: Date.now() - startTime,
      totalNeurons: this.neurons.size,
      totalSynapses: this.synapses.size
    };
    
    this.neuralHistory.push(activity);
    
    // Mantém histórico limitado
    if (this.neuralHistory.length > 1000) {
      this.neuralHistory = this.neuralHistory.slice(-1000);
    }
  }

  // Resume saídas para histórico
  summarizeOutputs(outputs) {
    const summary = {};
    
    for (const [networkName, networkOutputs] of Object.entries(outputs)) {
      summary[networkName] = {};
      
      for (const [neuronId, activation] of Object.entries(networkOutputs)) {
        summary[networkName][neuronId] = Math.round(activation * 100) / 100;
      }
    }
    
    return summary;
  }

  // Obtém estado atual da rede neural
  getNeuralState() {
    return {
      totalNeurons: this.neurons.size,
      totalSynapses: this.synapses.size,
      activeNeurons: this.activeNeurons.size,
      neuralActivity: this.neuralActivity,
      plasticity: this.plasticity,
      learningRate: this.learningRate,
      lastUpdate: this.lastUpdate,
      networks: Array.from(this.neuralNetworks.keys()),
      recentActivity: this.neuralHistory.slice(-10)
    };
  }

  // Obtém estatísticas da rede
  getNeuralStats() {
    const stats = {
      totalNeurons: this.neurons.size,
      totalSynapses: this.synapses.size,
      activeNeurons: this.activeNeurons.size,
      neuralActivity: this.neuralActivity,
      averageActivation: 0,
      strongestConnections: [],
      mostActiveNeurons: [],
      networkStats: {}
    };
    
    // Calcula ativação média
    let totalActivation = 0;
    for (const [neuronId, neuron] of this.neurons) {
      totalActivation += neuron.activation;
    }
    stats.averageActivation = totalActivation / this.neurons.size;
    
    // Encontra conexões mais fortes
    const connections = Array.from(this.synapses.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
    stats.strongestConnections = connections.map(synapse => ({
      from: synapse.from,
      to: synapse.to,
      strength: synapse.strength,
      weight: synapse.weight
    }));
    
    // Encontra neurônios mais ativos
    const neurons = Array.from(this.neurons.values())
      .sort((a, b) => b.activation - a.activation)
      .slice(0, 10);
    stats.mostActiveNeurons = neurons.map(neuron => ({
      id: neuron.id,
      type: neuron.type,
      activation: neuron.activation,
      fireCount: neuron.fireCount
    }));
    
    // Estatísticas por rede
    for (const [networkName, network] of this.neuralNetworks) {
      const networkNeurons = Array.from(this.neurons.values())
        .filter(neuron => neuron.network === networkName);
      
      const networkActivity = networkNeurons.reduce((sum, neuron) => sum + neuron.activation, 0);
      
      stats.networkStats[networkName] = {
        neuronCount: networkNeurons.length,
        averageActivation: networkActivity / networkNeurons.length,
        activeNeurons: networkNeurons.filter(neuron => neuron.activation > 0.1).length
      };
    }
    
    return stats;
  }

  // Salva estado da rede neural
  saveNeuralState() {
    try {
      const statePath = path.resolve(__dirname, '../../data/neuralState.json');
      const state = {
        neurons: Array.from(this.neurons.entries()),
        synapses: Array.from(this.synapses.entries()),
        neuralNetworks: Array.from(this.neuralNetworks.entries()),
        plasticity: this.plasticity,
        learningRate: this.learningRate,
        lastUpdate: this.lastUpdate,
        neuralHistory: this.neuralHistory.slice(-100) // Salva apenas últimas 100 entradas
      };
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Erro ao salvar estado neural:', error);
    }
  }

  // Carrega estado da rede neural
  loadNeuralState() {
    try {
      const statePath = path.resolve(__dirname, '../../data/neuralState.json');
      if (fs.existsSync(statePath)) {
        const data = fs.readFileSync(statePath, 'utf-8');
        const state = JSON.parse(data);
        
        this.neurons = new Map(state.neurons || []);
        this.synapses = new Map(state.synapses || []);
        this.neuralNetworks = new Map(state.neuralNetworks || []);
        this.plasticity = state.plasticity || 0.6;
        this.learningRate = state.learningRate || 0.1;
        this.lastUpdate = state.lastUpdate || new Date().toISOString();
        this.neuralHistory = state.neuralHistory || [];
      }
    } catch (error) {
      console.error('Erro ao carregar estado neural:', error);
    }
  }

  // Reseta a rede neural
  resetNeuralState() {
    this.neurons.clear();
    this.synapses.clear();
    this.neuralNetworks.clear();
    this.activeNeurons.clear();
    this.neuralActivity = 0;
    this.neuralHistory = [];
    this.initializeNeuralNetworks();
  }
}

export default NeuralState;
