// src/server.js - Servidor HTTP simples para health check no Render
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Alice Bot',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Alice Bot está funcionando!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`[SERVER] 🌐 Servidor HTTP rodando na porta ${PORT}`);
  console.log(`[SERVER] 🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
