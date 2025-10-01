// src/events/ready.js
export default {
  name: 'ready',
  once: true,
  execute(client) {
    const botName = process.env.BOT_NAME || 'Nanabot';
    const mentalAge = process.env.MENTAL_AGE || 'desconhecida';
    console.log(`🤖 ${botName} está online! Idade mental: ${mentalAge} anos.`);
  }
};
