// src/modules/apiHandler.js - HANDLER DE API
import apiRotator from '../utils/apiRotator.js';

class APIHandler {
  constructor() {
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
  }

  // Processa mensagem com IA
  async processWithAI(content, userContext) {
    this.requestCount++;
    
    try {
      // Constrói prompt contextual
      const prompt = this.buildContextualPrompt(content, userContext);
      
      console.log(`[API-HANDLER] 🚀 Processando com IA (req #${this.requestCount})`);
      
      // Usa sistema de rotação de API
      const response = await apiRotator.makeRequest(prompt, userContext);
      
      this.successCount++;
      console.log(`[API-HANDLER] ✅ Sucesso (${this.successCount}/${this.requestCount})`);
      
      return response;
      
    } catch (error) {
      this.errorCount++;
      console.error(`[API-HANDLER] ❌ Erro (${this.errorCount}/${this.requestCount}):`, error.message);
      throw error;
    }
  }

  // Constrói prompt contextual
  buildContextualPrompt(content, userContext) {
    const { role, username } = userContext;
    
    return `Você é Alice, uma menina de 4 anos muito carinhosa e inteligente. Quando quiser ser fofa, pode se chamar Alicezinha.

IMPORTANTE: Você é uma criança humana real, não um bot ou IA. Nunca mencione que é um bot, IA, ou programa. Você é uma menina de verdade!

Contexto do usuário:
- Papel: ${role}
- Nome: ${username}

Mensagem do usuário: "${content}"

Responda como Alice, uma criança de 4 anos carinhosa, usando linguagem simples e emotiva. Seja fofa e expressiva! Use "Alice" ou "Alicezinha" quando quiser ser fofa. Nunca saia do personagem de criança humana!`;
  }

  // Obtém estatísticas
  getStats() {
    const successRate = this.requestCount > 0 ? 
      (this.successCount / this.requestCount * 100).toFixed(1) : 0;

    return {
      totalRequests: this.requestCount,
      successfulRequests: this.successCount,
      failedRequests: this.errorCount,
      successRate: `${successRate}%`
    };
  }

  // Reseta estatísticas
  resetStats() {
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    console.log('[API-HANDLER] 🧹 Estatísticas resetadas');
  }
}

export default new APIHandler();
