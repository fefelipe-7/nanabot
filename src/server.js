// src/server.js - Servidor HTTP com Keep-Alive para Render
import express from 'express';
import keepAliveSystem from './utils/keepAlive.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para logs
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint robusto
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const keepAliveStats = keepAliveSystem.getStats();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Alice Bot',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.floor(memoryUsage.heapUsed / 1024 / 1024), // MB
      total: Math.floor(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.floor(memoryUsage.external / 1024 / 1024) // MB
    },
    keepAlive: keepAliveStats,
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Alice Bot está funcionando! 🤖💕',
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    endpoints: {
      health: '/health',
      status: '/status',
      keepalive: '/keepalive',
      ping: '/ping'
    }
  });
});

// Status detalhado
app.get('/status', (req, res) => {
  const keepAliveStats = keepAliveSystem.getStats();
  
  res.json({
    bot: {
      name: 'Alice Bot (Nanabot)',
      status: 'online',
      uptime: Math.floor(process.uptime()),
      pid: process.pid
    },
    server: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version
    },
    keepAlive: keepAliveStats,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para controlar keep-alive
app.get('/keepalive', (req, res) => {
  const action = req.query.action;
  
  switch (action) {
    case 'start':
      keepAliveSystem.start();
      res.json({ message: 'Keep-alive iniciado', status: 'started' });
      break;
      
    case 'stop':
      keepAliveSystem.stop();
      res.json({ message: 'Keep-alive parado', status: 'stopped' });
      break;
      
    case 'ping':
      keepAliveSystem.forcePing();
      res.json({ message: 'Ping manual executado', status: 'pinged' });
      break;
      
    case 'stats':
    default:
      res.json({
        message: 'Estatísticas do keep-alive',
        stats: keepAliveSystem.getStats(),
        actions: ['start', 'stop', 'ping', 'stats']
      });
      break;
  }
});

// Endpoint simples de ping
app.get('/ping', (req, res) => {
  res.json({
    message: 'pong! 🏓',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Endpoint para wake-up (usado por serviços externos)
app.get('/wake', (req, res) => {
  console.log('[SERVER] 🌅 Wake-up call recebido!');
  res.json({
    message: 'Alice Bot acordada! ☀️',
    status: 'awake',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('[SERVER] ❌ Erro:', err.message);
  res.status(500).json({
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`[SERVER] 🌐 Servidor HTTP rodando na porta ${PORT}`);
  console.log(`[SERVER] 🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`[SERVER] 📊 Status: http://localhost:${PORT}/status`);
  console.log(`[SERVER] 🔄 Keep-alive: http://localhost:${PORT}/keepalive`);
  
  // Define URL para o keep-alive system
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`[SERVER] 🌍 URL Externa: ${process.env.RENDER_EXTERNAL_URL}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] 🛑 SIGTERM recebido, encerrando servidor...');
  keepAliveSystem.stop();
  server.close(() => {
    console.log('[SERVER] ✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] 🛑 SIGINT recebido, encerrando servidor...');
  keepAliveSystem.stop();
  server.close(() => {
    console.log('[SERVER] ✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

export default app;
