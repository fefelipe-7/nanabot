// src/utils/stateManager.js - Gerenciador Central de Estados da Nanabot
// Coordena o carregamento e salvamento de todos os estados dos módulos cerebrais

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StateManager {
  constructor() {
    this.dataDir = path.resolve(__dirname, '../../data');
    this.ensureDataDirectory();
    this.stateCache = new Map();
    this.lastSave = new Date().toISOString();
    this.autoSaveInterval = 30000; // 30 segundos
    this.startAutoSave();
  }

  // Garante que o diretório de dados existe
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Inicia salvamento automático
  startAutoSave() {
    setInterval(() => {
      this.saveAllStates();
    }, this.autoSaveInterval);
  }

  // Carrega estado de um módulo
  loadState(moduleName, defaultState = {}) {
    try {
      // Verifica cache primeiro
      if (this.stateCache.has(moduleName)) {
        return this.stateCache.get(moduleName);
      }

      const statePath = path.join(this.dataDir, `${moduleName}State.json`);
      
      if (fs.existsSync(statePath)) {
        const data = fs.readFileSync(statePath, 'utf-8');
        const state = JSON.parse(data);
        
        // Adiciona ao cache
        this.stateCache.set(moduleName, state);
        
        return state;
      } else {
        // Cria estado padrão se não existir
        this.saveState(moduleName, defaultState);
        this.stateCache.set(moduleName, defaultState);
        return defaultState;
      }
    } catch (error) {
      console.error(`Erro ao carregar estado do módulo ${moduleName}:`, error);
      return defaultState;
    }
  }

  // Salva estado de um módulo
  saveState(moduleName, state) {
    try {
      const statePath = path.join(this.dataDir, `${moduleName}State.json`);
      
      // Adiciona metadados
      const stateWithMetadata = {
        ...state,
        lastUpdate: new Date().toISOString(),
        moduleName: moduleName
      };
      
      fs.writeFileSync(statePath, JSON.stringify(stateWithMetadata, null, 2));
      
      // Atualiza cache
      this.stateCache.set(moduleName, stateWithMetadata);
      
      this.lastSave = new Date().toISOString();
      
      return true;
    } catch (error) {
      console.error(`Erro ao salvar estado do módulo ${moduleName}:`, error);
      return false;
    }
  }

  // Salva todos os estados
  saveAllStates() {
    const modules = [
      'brain', 'emotion', 'mood', 'neural', 'attachment', 
      'preferences', 'estiloFala', 'age', 'learning', 
      'knowledge', 'pattern', 'reinforcement', 'imagination', 
      'curiosity', 'selfReflection', 'theoryOfMind'
    ];
    
    let savedCount = 0;
    let errorCount = 0;
    
    for (const module of modules) {
      if (this.stateCache.has(module)) {
        const success = this.saveState(module, this.stateCache.get(module));
        if (success) {
          savedCount++;
        } else {
          errorCount++;
        }
      }
    }
    
    console.log(`Estados salvos: ${savedCount}, Erros: ${errorCount}`);
    return { savedCount, errorCount };
  }

  // Atualiza estado no cache
  updateState(moduleName, updates) {
    try {
      const currentState = this.stateCache.get(moduleName) || {};
      const newState = { ...currentState, ...updates };
      this.stateCache.set(moduleName, newState);
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar estado do módulo ${moduleName}:`, error);
      return false;
    }
  }

  // Obtém estado de um módulo
  getState(moduleName) {
    return this.stateCache.get(moduleName) || {};
  }

  // Obtém todos os estados
  getAllStates() {
    const states = {};
    for (const [moduleName, state] of this.stateCache) {
      states[moduleName] = state;
    }
    return states;
  }

  // Reseta estado de um módulo
  resetState(moduleName, defaultState = {}) {
    try {
      const statePath = path.join(this.dataDir, `${moduleName}State.json`);
      
      if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath);
      }
      
      this.stateCache.set(moduleName, defaultState);
      this.saveState(moduleName, defaultState);
      
      return true;
    } catch (error) {
      console.error(`Erro ao resetar estado do módulo ${moduleName}:`, error);
      return false;
    }
  }

  // Reseta todos os estados
  resetAllStates() {
    const modules = [
      'brain', 'emotion', 'mood', 'neural', 'attachment', 
      'preferences', 'estiloFala', 'age', 'learning', 
      'knowledge', 'pattern', 'reinforcement', 'imagination', 
      'curiosity', 'selfReflection', 'theoryOfMind'
    ];
    
    let resetCount = 0;
    let errorCount = 0;
    
    for (const module of modules) {
      const success = this.resetState(module);
      if (success) {
        resetCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`Estados resetados: ${resetCount}, Erros: ${errorCount}`);
    return { resetCount, errorCount };
  }

  // Obtém estatísticas dos estados
  getStateStats() {
    const stats = {
      totalModules: this.stateCache.size,
      lastSave: this.lastSave,
      cacheSize: this.stateCache.size,
      modules: []
    };
    
    for (const [moduleName, state] of this.stateCache) {
      stats.modules.push({
        name: moduleName,
        lastUpdate: state.lastUpdate || 'unknown',
        size: JSON.stringify(state).length,
        hasData: Object.keys(state).length > 0
      });
    }
    
    return stats;
  }

  // Exporta todos os estados
  exportAllStates() {
    const exportData = {
      timestamp: new Date().toISOString(),
      states: this.getAllStates(),
      metadata: {
        totalModules: this.stateCache.size,
        lastSave: this.lastSave
      }
    };
    
    const exportPath = path.join(this.dataDir, 'export_all_states.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    return exportPath;
  }

  // Importa estados de um arquivo
  importStates(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const importData = JSON.parse(data);
      
      if (importData.states) {
        for (const [moduleName, state] of Object.entries(importData.states)) {
          this.stateCache.set(moduleName, state);
          this.saveState(moduleName, state);
        }
        
        console.log(`Estados importados: ${Object.keys(importData.states).length}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao importar estados:', error);
      return false;
    }
  }

  // Limpa cache
  clearCache() {
    this.stateCache.clear();
    console.log('Cache limpo');
  }

  // Obtém informações de um arquivo de estado
  getStateFileInfo(moduleName) {
    const statePath = path.join(this.dataDir, `${moduleName}State.json`);
    
    if (fs.existsSync(statePath)) {
      const stats = fs.statSync(statePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: statePath
      };
    }
    
    return { exists: false };
  }

  // Lista todos os arquivos de estado
  listStateFiles() {
    const files = fs.readdirSync(this.dataDir);
    const stateFiles = files.filter(file => file.endsWith('State.json'));
    
    return stateFiles.map(file => {
      const filePath = path.join(this.dataDir, file);
      const stats = fs.statSync(filePath);
      const moduleName = file.replace('State.json', '');
      
      return {
        moduleName,
        fileName: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: filePath
      };
    });
  }
}

// Instância singleton
const stateManager = new StateManager();

// Funções de conveniência
export const loadState = (moduleName, defaultState = {}) => {
  return stateManager.loadState(moduleName, defaultState);
};

export const saveState = (moduleName, state) => {
  return stateManager.saveState(moduleName, state);
};

export const updateState = (moduleName, updates) => {
  return stateManager.updateState(moduleName, updates);
};

export const getState = (moduleName) => {
  return stateManager.getState(moduleName);
};

export const resetState = (moduleName, defaultState = {}) => {
  return stateManager.resetState(moduleName, defaultState);
};

export const saveAllStates = () => {
  return stateManager.saveAllStates();
};

export const resetAllStates = () => {
  return stateManager.resetAllStates();
};

export const getStateStats = () => {
  return stateManager.getStateStats();
};

export const exportAllStates = () => {
  return stateManager.exportAllStates();
};

export const importStates = (filePath) => {
  return stateManager.importStates(filePath);
};

export const listStateFiles = () => {
  return stateManager.listStateFiles();
};

export default stateManager;
