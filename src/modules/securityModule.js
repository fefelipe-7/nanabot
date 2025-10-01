// src/modules/securityModule.js - Módulo de Segurança
import fs from 'fs';
import path from 'path';

class SecurityModule {
  constructor() {
    this.securityEvents = new Map();
    this.suspiciousPatterns = new Map();
    this.rateLimitTracker = new Map();
    this.failedAttempts = new Map();
    
    this.initializeSecurity();
  }

  // Inicializa configurações de segurança
  initializeSecurity() {
    console.log('[SECURITY-MODULE] 🔒 Inicializando módulo de segurança...');
    
    // Configurações padrão
    this.config = {
      maxFailedAttempts: 5,
      rateLimitWindow: 60000, // 1 minuto
      maxRequestsPerWindow: 10,
      suspiciousCommandThreshold: 20,
      enableSecurityLogs: process.env.ENABLE_SECURITY_LOGS === 'true',
      enableActivityMonitoring: process.env.ENABLE_ACTIVITY_MONITORING === 'true'
    };

    // Padrões suspeitos
    this.suspiciousPatterns.set('mass_commands', {
      threshold: 10,
      window: 30000, // 30 segundos
      description: 'Muitos comandos em sequência'
    });

    this.suspiciousPatterns.set('invalid_tokens', {
      threshold: 3,
      window: 60000, // 1 minuto
      description: 'Tokens inválidos'
    });

    this.suspiciousPatterns.set('api_abuse', {
      threshold: 50,
      window: 300000, // 5 minutos
      description: 'Abuso da API'
    });

    console.log('[SECURITY-MODULE] ✅ Módulo de segurança inicializado');
  }

  // Registra evento de segurança
  logSecurityEvent(eventType, details) {
    if (!this.config.enableSecurityLogs) return;

    const timestamp = new Date().toISOString();
    const event = {
      type: eventType,
      timestamp,
      details,
      severity: this.getSeverityLevel(eventType)
    };

    this.securityEvents.set(`${eventType}_${timestamp}`, event);
    
    console.log(`[SECURITY-EVENT] ${timestamp} - ${eventType}:`, details);
    
    // Limpa eventos antigos (mais de 24 horas)
    this.cleanOldEvents();
  }

  // Determina nível de severidade
  getSeverityLevel(eventType) {
    const severityLevels = {
      'unauthorized_access': 'HIGH',
      'rate_limit_exceeded': 'MEDIUM',
      'invalid_command': 'LOW',
      'api_error': 'MEDIUM',
      'suspicious_activity': 'HIGH',
      'mass_commands': 'MEDIUM',
      'invalid_tokens': 'HIGH',
      'api_abuse': 'HIGH'
    };

    return severityLevels[eventType] || 'LOW';
  }

  // Verifica atividade suspeita
  checkSuspiciousActivity(userId, activityType) {
    if (!this.config.enableActivityMonitoring) return false;

    const key = `${userId}_${activityType}`;
    const now = Date.now();
    
    if (!this.suspiciousPatterns.has(activityType)) return false;

    const pattern = this.suspiciousPatterns.get(activityType);
    const userActivity = this.rateLimitTracker.get(key) || { count: 0, firstSeen: now };

    // Reset se passou da janela de tempo
    if (now - userActivity.firstSeen > pattern.window) {
      userActivity.count = 1;
      userActivity.firstSeen = now;
    } else {
      userActivity.count++;
    }

    this.rateLimitTracker.set(key, userActivity);

    // Verifica se excedeu o threshold
    if (userActivity.count > pattern.threshold) {
      this.logSecurityEvent('suspicious_activity', {
        userId,
        activityType,
        count: userActivity.count,
        threshold: pattern.threshold,
        description: pattern.description
      });
      return true;
    }

    return false;
  }

  // Verifica rate limit
  checkRateLimit(userId, action = 'general') {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const userLimit = this.rateLimitTracker.get(key) || { count: 0, windowStart: now };

    // Reset se passou da janela
    if (now - userLimit.windowStart > this.config.rateLimitWindow) {
      userLimit.count = 1;
      userLimit.windowStart = now;
    } else {
      userLimit.count++;
    }

    this.rateLimitTracker.set(key, userLimit);

    if (userLimit.count > this.config.maxRequestsPerWindow) {
      this.logSecurityEvent('rate_limit_exceeded', {
        userId,
        action,
        count: userLimit.count,
        limit: this.config.maxRequestsPerWindow
      });
      return true;
    }

    return false;
  }

  // Registra tentativa falhada
  recordFailedAttempt(userId, reason) {
    const key = userId;
    const now = Date.now();
    const attempts = this.failedAttempts.get(key) || { count: 0, lastAttempt: now };

    attempts.count++;
    attempts.lastAttempt = now;

    this.failedAttempts.set(key, attempts);

    this.logSecurityEvent('invalid_command', {
      userId,
      reason,
      attemptCount: attempts.count
    });

    // Verifica se excedeu limite de tentativas
    if (attempts.count >= this.config.maxFailedAttempts) {
      this.logSecurityEvent('unauthorized_access', {
        userId,
        reason: 'Max failed attempts exceeded',
        attempts: attempts.count
      });
      return true;
    }

    return false;
  }

  // Sanitiza entrada do usuário
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '')                    // Remove HTML tags
      .replace(/javascript:/gi, '')           // Remove JavaScript
      .replace(/on\w+=/gi, '')                // Remove event handlers
      .replace(/data:/gi, '')                 // Remove data URIs
      .replace(/vbscript:/gi, '')             // Remove VBScript
      .trim()
      .substring(0, 2000);                   // Limita tamanho
  }

  // Valida comando
  validateCommand(command, args = []) {
    const allowedCommands = [
      'ping', 'help', 'status', 'modelos',
      'abracar', 'elogio', 'meama', 'chorar',
      'conta', 'historinha', 'memoria', 'fantasia',
      'teste-modelos-simples', 'teste-modelos-gradual'
    ];

    const maxArgs = 10;
    const maxCommandLength = 50;

    // Verifica se comando é permitido
    if (!allowedCommands.includes(command)) {
      this.logSecurityEvent('invalid_command', {
        command,
        reason: 'Command not allowed'
      });
      return false;
    }

    // Verifica tamanho do comando
    if (command.length > maxCommandLength) {
      this.logSecurityEvent('invalid_command', {
        command,
        reason: 'Command too long'
      });
      return false;
    }

    // Verifica número de argumentos
    if (args.length > maxArgs) {
      this.logSecurityEvent('invalid_command', {
        command,
        args: args.length,
        reason: 'Too many arguments'
      });
      return false;
    }

    // Sanitiza argumentos
    const sanitizedArgs = args.map(arg => this.sanitizeInput(arg));
    
    return {
      valid: true,
      command,
      args: sanitizedArgs
    };
  }

  // Limpa eventos antigos
  cleanOldEvents() {
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const [key, event] of this.securityEvents) {
      const eventTime = new Date(event.timestamp).getTime();
      if (now - eventTime > oneDay) {
        this.securityEvents.delete(key);
      }
    }

    // Limpa rate limit tracker
    for (const [key, data] of this.rateLimitTracker) {
      if (now - data.windowStart > this.config.rateLimitWindow * 2) {
        this.rateLimitTracker.delete(key);
      }
    }

    // Limpa tentativas falhadas
    for (const [key, data] of this.failedAttempts) {
      if (now - data.lastAttempt > this.config.rateLimitWindow) {
        this.failedAttempts.delete(key);
      }
    }
  }

  // Obtém estatísticas de segurança
  getSecurityStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    let recentEvents = 0;
    let highSeverityEvents = 0;
    let mediumSeverityEvents = 0;
    let lowSeverityEvents = 0;

    for (const [key, event] of this.securityEvents) {
      const eventTime = new Date(event.timestamp).getTime();
      if (now - eventTime < oneHour) {
        recentEvents++;
        
        switch (event.severity) {
          case 'HIGH':
            highSeverityEvents++;
            break;
          case 'MEDIUM':
            mediumSeverityEvents++;
            break;
          case 'LOW':
            lowSeverityEvents++;
            break;
        }
      }
    }

    return {
      totalEvents: this.securityEvents.size,
      recentEvents,
      highSeverityEvents,
      mediumSeverityEvents,
      lowSeverityEvents,
      activeRateLimits: this.rateLimitTracker.size,
      failedAttempts: this.failedAttempts.size,
      config: this.config
    };
  }

  // Exporta logs de segurança
  exportSecurityLogs() {
    const logs = Array.from(this.securityEvents.values());
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `security-logs-${timestamp}.json`;
    
    try {
      fs.writeFileSync(filename, JSON.stringify(logs, null, 2));
      console.log(`[SECURITY-MODULE] 📄 Logs exportados para: ${filename}`);
      return filename;
    } catch (error) {
      console.error('[SECURITY-MODULE] ❌ Erro ao exportar logs:', error.message);
      return null;
    }
  }
}

export default new SecurityModule();
