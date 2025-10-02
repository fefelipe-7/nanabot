// src/utils/keepAlive.js - Sistema de Keep-Alive para Render
import fetch from 'node-fetch';

class KeepAliveSystem {
  constructor() {
    this.isActive = false;
    this.pingInterval = null;
    this.healthCheckInterval = null;
    this.selfPingInterval = null;
    
    // Configurações
    this.config = {
      // Intervalo para ping externo (14 minutos - antes dos 15min do Render)
      pingIntervalMs: 14 * 60 * 1000, // 14 minutos
      
      // Intervalo para health check interno (5 minutos)
      healthCheckIntervalMs: 5 * 60 * 1000, // 5 minutos
      
      // Intervalo para auto-ping (10 minutos)
      selfPingIntervalMs: 10 * 60 * 1000, // 10 minutos
      
      // URLs para manter ativo
      externalUrls: [
        'https://httpstat.us/200', // Serviço de teste HTTP
        'https://api.github.com/zen', // API pública do GitHub
      ],
      
      // URL do próprio serviço (será definida dinamicamente)
      selfUrl: process.env.RENDER_EXTERNAL_URL || null,
      
      // Timeout para requisições
      requestTimeout: 10000, // 10 segundos
      
      // Retry attempts
      maxRetries: 3
    };
    
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPing: null,
      lastError: null,
      uptime: Date.now()
    };
    
    console.log('[KEEP-ALIVE] 🔄 Sistema de Keep-Alive inicializado');
  }

  // Inicia o sistema de keep-alive
  start() {
    if (this.isActive) {
      console.log('[KEEP-ALIVE] ⚠️ Sistema já está ativo');
      return;
    }

    this.isActive = true;
    console.log('[KEEP-ALIVE] 🚀 Iniciando sistema de keep-alive...');
    
    // Detecta URL do Render automaticamente
    this.detectRenderUrl();
    
    // Inicia ping externo
    this.startExternalPing();
    
    // Inicia health check interno
    this.startHealthCheck();
    
    // Inicia auto-ping (se URL disponível)
    if (this.config.selfUrl) {
      this.startSelfPing();
    }
    
    // Log inicial
    this.logStatus();
    
    console.log('[KEEP-ALIVE] ✅ Sistema de keep-alive ativo!');
  }

  // Para o sistema de keep-alive
  stop() {
    if (!this.isActive) {
      console.log('[KEEP-ALIVE] ⚠️ Sistema já está inativo');
      return;
    }

    this.isActive = false;
    
    // Limpa todos os intervalos
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.selfPingInterval) {
      clearInterval(this.selfPingInterval);
      this.selfPingInterval = null;
    }
    
    console.log('[KEEP-ALIVE] 🛑 Sistema de keep-alive parado');
  }

  // Detecta URL do Render automaticamente
  detectRenderUrl() {
    // Tenta várias formas de detectar a URL
    const possibleUrls = [
      process.env.RENDER_EXTERNAL_URL,
      process.env.RENDER_SERVICE_URL,
      process.env.PUBLIC_URL,
      process.env.APP_URL
    ];
    
    for (const url of possibleUrls) {
      if (url && url.includes('render.com')) {
        this.config.selfUrl = url;
        console.log(`[KEEP-ALIVE] 🔗 URL detectada: ${url}`);
        break;
      }
    }
    
    if (!this.config.selfUrl) {
      console.log('[KEEP-ALIVE] ⚠️ URL do Render não detectada - auto-ping desabilitado');
    }
  }

  // Inicia ping externo para manter conexão ativa
  startExternalPing() {
    this.pingInterval = setInterval(async () => {
      await this.performExternalPing();
    }, this.config.pingIntervalMs);
    
    // Executa primeiro ping imediatamente
    setTimeout(() => this.performExternalPing(), 5000);
  }

  // Inicia health check interno
  startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
  }

  // Inicia auto-ping para o próprio serviço
  startSelfPing() {
    if (!this.config.selfUrl) return;
    
    this.selfPingInterval = setInterval(async () => {
      await this.performSelfPing();
    }, this.config.selfPingIntervalMs);
    
    // Executa primeiro auto-ping após 2 minutos
    setTimeout(() => this.performSelfPing(), 2 * 60 * 1000);
  }

  // Executa ping externo
  async performExternalPing() {
    const url = this.config.externalUrls[Math.floor(Math.random() * this.config.externalUrls.length)];
    
    try {
      console.log(`[KEEP-ALIVE] 🌐 Ping externo para: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        timeout: this.config.requestTimeout,
        headers: {
          'User-Agent': 'Alice-Bot-KeepAlive/1.0'
        }
      });
      
      if (response.ok) {
        this.stats.successfulPings++;
        console.log(`[KEEP-ALIVE] ✅ Ping externo bem-sucedido (${response.status})`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      this.stats.failedPings++;
      this.stats.lastError = error.message;
      console.log(`[KEEP-ALIVE] ❌ Ping externo falhou: ${error.message}`);
    }
    
    this.stats.totalPings++;
    this.stats.lastPing = new Date().toISOString();
  }

  // Executa auto-ping para o próprio serviço
  async performSelfPing() {
    if (!this.config.selfUrl) return;
    
    const healthUrl = `${this.config.selfUrl}/health`;
    
    try {
      console.log(`[KEEP-ALIVE] 🔄 Auto-ping para: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        timeout: this.config.requestTimeout,
        headers: {
          'User-Agent': 'Alice-Bot-SelfPing/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[KEEP-ALIVE] ✅ Auto-ping bem-sucedido - Uptime: ${Math.floor(data.uptime)}s`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.log(`[KEEP-ALIVE] ❌ Auto-ping falhou: ${error.message}`);
    }
  }

  // Executa health check interno
  performHealthCheck() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    console.log(`[KEEP-ALIVE] 💓 Health Check - Uptime: ${Math.floor(uptime)}s, Memory: ${Math.floor(memoryUsage.heapUsed / 1024 / 1024)}MB`);
    
    // Verifica se há problemas de memória
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.log('[KEEP-ALIVE] ⚠️ Alto uso de memória detectado');
    }
  }

  // Log do status atual
  logStatus() {
    const uptime = Math.floor((Date.now() - this.stats.uptime) / 1000);
    const successRate = this.stats.totalPings > 0 ? 
      ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1) : 0;
    
    console.log(`[KEEP-ALIVE] 📊 Status:`);
    console.log(`  - Ativo: ${this.isActive ? '✅' : '❌'}`);
    console.log(`  - Uptime: ${uptime}s`);
    console.log(`  - Total Pings: ${this.stats.totalPings}`);
    console.log(`  - Taxa de Sucesso: ${successRate}%`);
    console.log(`  - Último Ping: ${this.stats.lastPing || 'Nunca'}`);
    console.log(`  - URL Self: ${this.config.selfUrl || 'Não detectada'}`);
  }

  // Obtém estatísticas
  getStats() {
    const uptime = Math.floor((Date.now() - this.stats.uptime) / 1000);
    const successRate = this.stats.totalPings > 0 ? 
      ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1) : 0;
    
    return {
      isActive: this.isActive,
      uptime: uptime,
      totalPings: this.stats.totalPings,
      successfulPings: this.stats.successfulPings,
      failedPings: this.stats.failedPings,
      successRate: `${successRate}%`,
      lastPing: this.stats.lastPing,
      lastError: this.stats.lastError,
      selfUrl: this.config.selfUrl,
      config: {
        pingInterval: `${this.config.pingIntervalMs / 1000}s`,
        healthCheckInterval: `${this.config.healthCheckIntervalMs / 1000}s`,
        selfPingInterval: `${this.config.selfPingIntervalMs / 1000}s`
      }
    };
  }

  // Força um ping manual
  async forcePing() {
    console.log('[KEEP-ALIVE] 🔄 Ping manual solicitado');
    await this.performExternalPing();
    if (this.config.selfUrl) {
      await this.performSelfPing();
    }
  }
}

// Instância global
const keepAliveSystem = new KeepAliveSystem();

// Auto-start se estiver no Render
if (process.env.RENDER || process.env.NODE_ENV === 'production') {
  // Aguarda 10 segundos para o bot inicializar completamente
  setTimeout(() => {
    keepAliveSystem.start();
  }, 10000);
}

export default keepAliveSystem;
