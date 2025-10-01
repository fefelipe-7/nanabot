// src/events/ready.js
import brainModule from '../core/brain.js';
const { nanabotBrain } = brainModule;

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    const botName = process.env.BOT_NAME || 'Alice';
    const mentalAge = nanabotBrain.age.idadeMental.toFixed(1);
    console.log(`👧 ${botName} está online! Idade mental: ${mentalAge} anos.`);
    
    // Teste automático desabilitado para evitar rate limit
    // Use n!teste-modelos-gradual para testar modelos manualmente
    console.log('[INIT] ⚠️ Teste automático de modelos desabilitado para evitar rate limit');
    console.log('[INIT] 💡 Use n!teste-modelos-gradual para testar modelos manualmente');
    console.log('[INIT] 🎯 Bot pronto para uso com sistema de rate limit otimizado');
  }
};