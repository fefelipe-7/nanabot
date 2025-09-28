// src/events/ready.js
import brainModule from '../core/brain.js';
const { nanabotBrain } = brainModule;

export default {
  name: 'ready',
  once: true,
  execute(client) {
    const botName = process.env.BOT_NAME || 'Nanabot';
    const mentalAge = nanabotBrain.age.idadeMental.toFixed(1);
    console.log(`🤖 ${botName} está online! Idade mental: ${mentalAge} anos.`);
  }
};
