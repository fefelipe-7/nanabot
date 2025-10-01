// src/utils/apiRotator.js - SISTEMA DE ROTAÇÃO DE MODELOS DE API
import { EventEmitter } from 'events';

class APIRotator extends EventEmitter {
  constructor() {
    super();
    
    // Lista de modelos disponíveis com suas configurações
    // Modelos gratuitos do OpenRouter - APENAS OS QUE FUNCIONAM + NOVOS PARA TESTE
    this.models = [
      // === MODELOS FUNCIONANDO (CONFIRMADOS) ===
      {
        name: 'nvidia/nemotron-nano-9b-v2:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 1,
        dailyLimit: 2000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Modelo NVIDIA otimizado para conversação'
      },
      {
        name: 'deepseek/deepseek-chat-v3.1:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 2,
        dailyLimit: 1500,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'DeepSeek Chat v3.1 - Excelente para diálogos'
      },
      {
        name: 'moonshotai/kimi-dev-72b:free',
        provider: 'OpenRouter',
        maxTokens: 2048,
        temperature: 0.7,
        priority: 3,
        dailyLimit: 800,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Kimi Dev 72B - Versão de desenvolvimento'
      },
      {
        name: 'mistralai/mistral-small-3.2-24b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 4,
        dailyLimit: 1200,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Mistral Small 3.2 - Modelo francês eficiente'
      },
      {
        name: 'meta-llama/llama-3.3-8b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 5,
        dailyLimit: 1500,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Llama 3.3 8B - Última versão do Meta'
      },
      {
        name: 'qwen/qwen3-coder:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 6,
        dailyLimit: 1000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Qwen3 Coder - Especializado em programação'
      },
      {
        name: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 7,
        dailyLimit: 800,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Dolphin Mistral - Modelo fine-tuned'
      },
      {
        name: 'google/gemma-3n-e2b-it:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 8,
        dailyLimit: 1000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'confirmed',
        description: 'Gemma 3N - Modelo Google otimizado'
      },
      
      // === NOVOS MODELOS PARA TESTE ===
      {
        name: 'mistralai/mistral-7b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 9,
        dailyLimit: 1500,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Mistral 7B Instruct - Modelo compacto e eficiente'
      },
      {
        name: 'google/gemma-2-9b-it:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 10,
        dailyLimit: 1200,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Gemma 2 9B IT - Nova versão Google'
      },
      {
        name: 'mistralai/mistral-nemo:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 11,
        dailyLimit: 1000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Mistral Nemo - Modelo experimental'
      },
      {
        name: 'qwen/qwen-2.5-72b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 2048,
        temperature: 0.7,
        priority: 12,
        dailyLimit: 800,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Qwen 2.5 72B - Modelo grande e poderoso'
      },
      {
        name: 'meta-llama/llama-3.2-3b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 13,
        dailyLimit: 2000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Llama 3.2 3B - Modelo leve e rápido'
      },
      {
        name: 'meta-llama/llama-3.3-70b-instruct:free',
        provider: 'OpenRouter',
        maxTokens: 2048,
        temperature: 0.7,
        priority: 14,
        dailyLimit: 600,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Llama 3.3 70B - Modelo grande e avançado'
      },
      {
        name: 'google/gemini-2.0-flash-exp:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 15,
        dailyLimit: 1000,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Gemini 2.0 Flash Experimental - Nova versão Google'
      },
      {
        name: 'deepseek/deepseek-r1-distill-llama-70b:free',
        provider: 'OpenRouter',
        maxTokens: 2048,
        temperature: 0.7,
        priority: 16,
        dailyLimit: 600,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'DeepSeek R1 Distill Llama 70B - Modelo de raciocínio'
      },
      {
        name: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
        provider: 'OpenRouter',
        maxTokens: 1024,
        temperature: 0.7,
        priority: 17,
        dailyLimit: 800,
        requestsUsed: 0,
        lastReset: Date.now(),
        isActive: true,
        category: 'testing',
        description: 'Dolphin 3.0 Mistral 24B - Nova versão fine-tuned'
      }
    ];

    this.currentModelIndex = 0;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.rotationCount = 0;
    
    // Configurações
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo
    this.rateLimitDelay = 5000; // 5 segundos
    
    console.log(`[API-ROTATOR] 🔄 Inicializado com ${this.models.length} modelos`);
  }

  // Obtém o próximo modelo disponível
  getNextModel() {
    // Filtra modelos ativos e com limite disponível
    const availableModels = this.models.filter(model => 
      model.isActive && model.requestsUsed < model.dailyLimit
    );

    if (availableModels.length === 0) {
      console.log('[API-ROTATOR] ⚠️ Todos os modelos atingiram o limite diário');
      this.resetDailyLimits();
      return this.models[0]; // Retorna o primeiro modelo após reset
    }

    // Ordena por prioridade e uso
    availableModels.sort((a, b) => {
      const aUsage = a.requestsUsed / a.dailyLimit;
      const bUsage = b.requestsUsed / b.dailyLimit;
      
      if (Math.abs(aUsage - bUsage) < 0.1) {
        return a.priority - b.priority; // Mesmo uso, usa prioridade
      }
      return aUsage - bUsage; // Menor uso primeiro
    });

    const selectedModel = availableModels[0];
    console.log(`[API-ROTATOR] 🎯 Selecionado: ${selectedModel.name} (${selectedModel.requestsUsed}/${selectedModel.dailyLimit})`);
    
    return selectedModel;
  }

  // Faz requisição com rotação automática
  async makeRequest(prompt, userMetadata) {
    let lastError = null;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      const model = this.getNextModel();
      
      try {
        console.log(`[API-ROTATOR] 🚀 Tentativa ${attempts + 1} com ${model.name}`);
        
        const response = await this.callAPI(model, prompt);
        
        // Sucesso - atualiza estatísticas
        model.requestsUsed++;
        this.totalRequests++;
        this.successfulRequests++;
        
        console.log(`[API-ROTATOR] ✅ Sucesso com ${model.name}`);
        
        // Emite evento de sucesso
        this.emit('requestSuccess', {
          model: model.name,
          attempts: attempts + 1,
          totalRequests: this.totalRequests
        });
        
        return response;
        
      } catch (error) {
        lastError = error;
        attempts++;
        
        console.log(`[API-ROTATOR] ❌ Erro com ${model.name}: ${error.message}`);
        
        // Se for rate limit, marca modelo como temporariamente indisponível
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log(`[API-ROTATOR] ⏳ Rate limit em ${model.name}, aguardando...`);
          await this.handleRateLimit(model);
        }
        
        // Se for erro de modelo (404, not found), desativa temporariamente
        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('model')) {
          console.log(`[API-ROTATOR] 🚫 Modelo ${model.name} indisponível (404), desativando temporariamente`);
          model.isActive = false;
          
          // Reativa após 30 minutos
          setTimeout(() => {
            model.isActive = true;
            console.log(`[API-ROTATOR] 🔄 Modelo ${model.name} reativado`);
          }, 1800000); // 30 minutos
        }
      }
    }

    // Todas as tentativas falharam
    this.failedRequests++;
    console.log(`[API-ROTATOR] 💥 Todas as tentativas falharam após ${attempts} tentativas`);
    
    // Emite evento de falha
    this.emit('requestFailed', {
      error: lastError,
      attempts: attempts,
      totalRequests: this.totalRequests
    });
    
    throw lastError;
  }

  // Chama a API específica
  async callAPI(model, prompt) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: model.name,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: model.maxTokens,
        temperature: model.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    
    if (!message) {
      throw new Error('Resposta inválida da API');
    }

    return message.trim();
  }

  // Lida com rate limit
  async handleRateLimit(model) {
    // Desativa o modelo temporariamente para evitar mais rate limits
    model.isActive = false;
    console.log(`[API-ROTATOR] 🚫 Desativando ${model.name} temporariamente devido ao rate limit`);
    
    // Aguarda mais tempo para rate limit
    const waitTime = 15000 + (Math.random() * 10000); // 15-25 segundos
    console.log(`[API-ROTATOR] ⏳ Aguardando ${waitTime}ms antes de tentar novamente...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Reativa o modelo após o delay
    model.isActive = true;
    console.log(`[API-ROTATOR] 🔄 Reativando ${model.name} após rate limit`);
  }

  // Reseta limites diários
  resetDailyLimits() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    this.models.forEach(model => {
      if (now - model.lastReset > oneDay) {
        model.requestsUsed = 0;
        model.lastReset = now;
        model.isActive = true;
        console.log(`[API-ROTATOR] 🔄 Reset diário para ${model.name}`);
      }
    });
  }

  // Obtém estatísticas
  getStats() {
    const activeModels = this.models.filter(m => m.isActive).length;
    const totalDailyLimit = this.models.reduce((sum, m) => sum + m.dailyLimit, 0);
    const totalUsed = this.models.reduce((sum, m) => sum + m.requestsUsed, 0);
    const successRate = this.totalRequests > 0 ?
      (this.successfulRequests / this.totalRequests * 100).toFixed(1) : 0;

    // Estatísticas por categoria
    const categoryStats = {};
    this.models.forEach(model => {
      if (!categoryStats[model.category]) {
        categoryStats[model.category] = {
          total: 0,
          active: 0,
          totalLimit: 0,
          totalUsed: 0
        };
      }
      categoryStats[model.category].total++;
      if (model.isActive) categoryStats[model.category].active++;
      categoryStats[model.category].totalLimit += model.dailyLimit;
      categoryStats[model.category].totalUsed += model.requestsUsed;
    });

    return {
      totalModels: this.models.length,
      activeModels: activeModels,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: `${successRate}%`,
      totalDailyLimit: totalDailyLimit,
      totalUsed: totalUsed,
      remainingRequests: totalDailyLimit - totalUsed,
      categoryStats: categoryStats,
      confirmedModels: this.models.filter(m => m.category === 'confirmed' && m.isActive).length,
      testingModels: this.models.filter(m => m.category === 'testing' && m.isActive).length,
      models: this.models.map(m => ({
        name: m.name,
        category: m.category,
        description: m.description,
        used: m.requestsUsed,
        limit: m.dailyLimit,
        isActive: m.isActive,
        usage: `${m.requestsUsed}/${m.dailyLimit}`,
        usagePercent: ((m.requestsUsed / m.dailyLimit) * 100).toFixed(1)
      }))
    };
  }

  // Força rotação para o próximo modelo
  forceRotation() {
    this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
    this.rotationCount++;
    console.log(`[API-ROTATOR] 🔄 Rotação forçada para modelo ${this.currentModelIndex + 1}`);
  }

  // Limpa todas as estatísticas
  clearStats() {
    this.models.forEach(model => {
      model.requestsUsed = 0;
      model.isActive = true;
      model.lastReset = Date.now();
    });
    
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.rotationCount = 0;
    
    console.log('[API-ROTATOR] 🧹 Todas as estatísticas foram limpas');
  }
}

// Instância global do rotador
const apiRotator = new APIRotator();

// Event listeners para debug
apiRotator.on('requestSuccess', (data) => {
  console.log(`[API-ROTATOR] 🎉 Requisição bem-sucedida: ${data.model} (${data.attempts} tentativas)`);
});

apiRotator.on('requestFailed', (data) => {
  console.log(`[API-ROTATOR] 💥 Requisição falhou após ${data.attempts} tentativas`);
});

export default apiRotator;
