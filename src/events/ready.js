// src/events/ready.js
import brainModule from '../core/brain.js';
import modelTester from '../utils/modelTester.js';
const { nanabotBrain } = brainModule;

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    const botName = process.env.BOT_NAME || 'Alice';
    const mentalAge = nanabotBrain.age.idadeMental.toFixed(1);
    console.log(`👧 ${botName} está online! Idade mental: ${mentalAge} anos.`);
    
    // Testa modelos de API em background
    setTimeout(async () => {
      console.log('[INIT] 🧪 Testando modelos de API...');
      await modelTester.testAllModels();
    }, 5000); // Aguarda 5 segundos após inicialização
  }
};
