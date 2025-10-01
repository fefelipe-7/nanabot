// src/utils/modelTester.js - TESTADOR DE MODELOS DE API
import apiRotator from './apiRotator.js';

class ModelTester {
  constructor() {
    this.testResults = new Map();
    this.isTesting = false;
  }

  // Testa um modelo específico
  async testModel(modelName) {
    console.log(`[MODEL-TESTER] 🧪 Testando modelo: ${modelName}`);
    
    try {
      const testPrompt = "Responda apenas 'OK' se você conseguir me entender.";
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.choices?.[0]?.message?.content;
        
        if (message) {
          console.log(`[MODEL-TESTER] ✅ ${modelName} - FUNCIONANDO`);
          this.testResults.set(modelName, { status: 'working', lastTest: Date.now() });
          return true;
        }
      }
      
      console.log(`[MODEL-TESTER] ❌ ${modelName} - ERRO: ${response.status}`);
      this.testResults.set(modelName, { status: 'error', lastTest: Date.now(), error: response.status });
      return false;
      
    } catch (error) {
      console.log(`[MODEL-TESTER] ❌ ${modelName} - EXCEÇÃO: ${error.message}`);
      this.testResults.set(modelName, { status: 'error', lastTest: Date.now(), error: error.message });
      return false;
    }
  }

  // Testa todos os modelos do rotador (APENAS PARA USO MANUAL)
  async testAllModels() {
    if (this.isTesting) {
      console.log('[MODEL-TESTER] ⏳ Teste já em andamento...');
      return;
    }

    this.isTesting = true;
    console.log('[MODEL-TESTER] 🚀 Iniciando teste de todos os modelos...');
    console.log('[MODEL-TESTER] ⚠️ AVISO: Este teste pode levar vários minutos devido aos delays de segurança');

    const workingModels = [];
    const failedModels = [];

    for (const model of apiRotator.models) {
      const isWorking = await this.testModel(model.name);
      
      if (isWorking) {
        workingModels.push(model.name);
        model.isActive = true;
      } else {
        failedModels.push(model.name);
        model.isActive = false;
      }
      
      // Aguarda 5 segundos entre testes para evitar rate limit (AUMENTADO)
      console.log(`[MODEL-TESTER] ⏳ Aguardando 5 segundos antes do próximo teste...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    this.isTesting = false;
    
    console.log(`[MODEL-TESTER] 📊 Resultado do teste:`);
    console.log(`[MODEL-TESTER] ✅ Modelos funcionando: ${workingModels.length}`);
    console.log(`[MODEL-TESTER] ❌ Modelos com erro: ${failedModels.length}`);
    
    if (workingModels.length > 0) {
      console.log(`[MODEL-TESTER] 🎯 Modelos ativos: ${workingModels.join(', ')}`);
    }
    
    if (failedModels.length > 0) {
      console.log(`[MODEL-TESTER] 🚫 Modelos inativos: ${failedModels.join(', ')}`);
    }

    return {
      working: workingModels,
      failed: failedModels,
      totalWorking: workingModels.length,
      totalFailed: failedModels.length
    };
  }

  // Obtém status de um modelo
  getModelStatus(modelName) {
    return this.testResults.get(modelName) || { status: 'unknown', lastTest: null };
  }

  // Obtém todos os resultados
  getAllResults() {
    const results = {};
    for (const [model, data] of this.testResults) {
      results[model] = data;
    }
    return results;
  }

  // Limpa resultados antigos (mais de 1 hora)
  clearOldResults() {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [model, data] of this.testResults) {
      if (now - data.lastTest > oneHour) {
        this.testResults.delete(model);
      }
    }
  }
}

export default new ModelTester();