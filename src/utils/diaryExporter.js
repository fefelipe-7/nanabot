// src/utils/diaryExporter.js - Exportador de Diário da Nanabot
// Exporta memórias, interações e experiências da Nanabot em formato de diário

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryDB, selectDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DiaryExporter {
  constructor() {
    this.exportPath = path.join(__dirname, '../../data/exports');
    this.templates = {
      markdown: this.getMarkdownTemplate(),
      html: this.getHtmlTemplate(),
      json: this.getJsonTemplate(),
      txt: this.getTxtTemplate()
    };
    this.lastExport = null;
    this.exportHistory = [];
  }

  // Template Markdown
  getMarkdownTemplate() {
    return `# 📖 Diário da Nanabot - {date}

## 🌟 Resumo do Dia
{summary}

## 💭 Memórias Especiais
{memories}

## 😊 Emoções do Dia
{emotions}

## 📚 Aprendizados
{learnings}

## 🎭 Histórias Criadas
{stories}

## 💕 Interações Especiais
{interactions}

## 🌱 Crescimento
{growth}

---
*Diário gerado automaticamente em {timestamp}*
`;
  }

  // Template HTML
  getHtmlTemplate() {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diário da Nanabot - {date}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f9f9f9; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #e91e63; text-align: center; margin-bottom: 30px; }
        h2 { color: #9c27b0; border-bottom: 2px solid #e91e63; padding-bottom: 10px; }
        .section { margin: 30px 0; }
        .memory, .emotion, .learning, .story, .interaction, .growth { 
            background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #e91e63; 
        }
        .timestamp { color: #666; font-size: 0.9em; text-align: center; margin-top: 40px; }
        .summary { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📖 Diário da Nanabot - {date}</h1>
        
        <div class="summary">
            <h2>🌟 Resumo do Dia</h2>
            {summary}
        </div>
        
        <div class="section">
            <h2>💭 Memórias Especiais</h2>
            {memories}
        </div>
        
        <div class="section">
            <h2>😊 Emoções do Dia</h2>
            {emotions}
        </div>
        
        <div class="section">
            <h2>📚 Aprendizados</h2>
            {learnings}
        </div>
        
        <div class="section">
            <h2>🎭 Histórias Criadas</h2>
            {stories}
        </div>
        
        <div class="section">
            <h2>💕 Interações Especiais</h2>
            {interactions}
        </div>
        
        <div class="section">
            <h2>🌱 Crescimento</h2>
            {growth}
        </div>
        
        <div class="timestamp">
            Diário gerado automaticamente em {timestamp}
        </div>
    </div>
</body>
</html>`;
  }

  // Template JSON
  getJsonTemplate() {
    return `{
  "diary": {
    "date": "{date}",
    "timestamp": "{timestamp}",
    "summary": {summary},
    "memories": {memories},
    "emotions": {emotions},
    "learnings": {learnings},
    "stories": {stories},
    "interactions": {interactions},
    "growth": {growth}
  }
}`;
  }

  // Template TXT
  getTxtTemplate() {
    return `DIÁRIO DA NANABOT - {date}
=====================================

RESUMO DO DIA:
{summary}

MEMÓRIAS ESPECIAIS:
{memories}

EMOÇÕES DO DIA:
{emotions}

APRENDIZADOS:
{learnings}

HISTÓRIAS CRIADAS:
{stories}

INTERAÇÕES ESPECIAIS:
{interactions}

CRESCIMENTO:
{growth}

=====================================
Diário gerado automaticamente em {timestamp}`;
  }

  // Exporta diário completo
  async exportDiary(format = 'markdown', date = null, options = {}) {
    try {
      const exportDate = date || new Date().toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      
      // Coleta dados do dia
      const data = await this.collectDayData(exportDate, options);
      
      // Gera conteúdo baseado no formato
      const content = this.generateContent(format, data, exportDate, timestamp);
      
      // Salva arquivo
      const filename = `nanabot_diary_${exportDate}.${this.getFileExtension(format)}`;
      const filepath = path.join(this.exportPath, filename);
      
      await this.ensureExportDirectory();
      await fs.writeFile(filepath, content, 'utf8');
      
      // Registra exportação
      this.lastExport = {
        date: exportDate,
        format: format,
        filepath: filepath,
        timestamp: timestamp,
        dataSize: data.totalRecords
      };
      
      this.exportHistory.push(this.lastExport);
      
      console.log(`✅ Diário exportado: ${filepath}`);
      
      return {
        success: true,
        filepath: filepath,
        filename: filename,
        format: format,
        date: exportDate,
        dataSize: data.totalRecords
      };
      
    } catch (error) {
      console.error('Erro ao exportar diário:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Coleta dados do dia
  async collectDayData(date, options = {}) {
    try {
      const data = {
        memories: [],
        emotions: [],
        learnings: [],
        stories: [],
        interactions: [],
        growth: [],
        totalRecords: 0
      };
      
      // Memórias do dia
      if (options.includeMemories !== false) {
        data.memories = await selectDB('memories', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Emoções do dia
      if (options.includeEmotions !== false) {
        data.emotions = await selectDB('emotions_log', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Aprendizados do dia
      if (options.includeLearnings !== false) {
        data.learnings = await selectDB('learning_records', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Histórias do dia
      if (options.includeStories !== false) {
        data.stories = await selectDB('stories', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Interações do dia
      if (options.includeInteractions !== false) {
        data.interactions = await selectDB('interactions', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Marcos de crescimento do dia
      if (options.includeGrowth !== false) {
        data.growth = await selectDB('growth_milestones', '*', 'DATE(created_at) = ?', [date]);
      }
      
      // Conta total de registros
      data.totalRecords = data.memories.length + data.emotions.length + 
                         data.learnings.length + data.stories.length + 
                         data.interactions.length + data.growth.length;
      
      return data;
    } catch (error) {
      console.error('Erro ao coletar dados do dia:', error);
      throw error;
    }
  }

  // Gera conteúdo baseado no formato
  generateContent(format, data, date, timestamp) {
    const template = this.templates[format];
    if (!template) {
      throw new Error(`Formato não suportado: ${format}`);
    }
    
    let content = template;
    
    // Substitui placeholders
    content = content.replace(/{date}/g, date);
    content = content.replace(/{timestamp}/g, timestamp);
    content = content.replace(/{summary}/g, this.generateSummary(data));
    content = content.replace(/{memories}/g, this.formatMemories(data.memories, format));
    content = content.replace(/{emotions}/g, this.formatEmotions(data.emotions, format));
    content = content.replace(/{learnings}/g, this.formatLearnings(data.learnings, format));
    content = content.replace(/{stories}/g, this.formatStories(data.stories, format));
    content = content.replace(/{interactions}/g, this.formatInteractions(data.interactions, format));
    content = content.replace(/{growth}/g, this.formatGrowth(data.growth, format));
    
    return content;
  }

  // Gera resumo do dia
  generateSummary(data) {
    const totalMemories = data.memories.length;
    const totalEmotions = data.emotions.length;
    const totalLearnings = data.learnings.length;
    const totalStories = data.stories.length;
    const totalInteractions = data.interactions.length;
    const totalGrowth = data.growth.length;
    
    return `Hoje foi um dia especial! Criei ${totalMemories} memórias, senti ${totalEmotions} emoções diferentes, aprendi ${totalLearnings} coisas novas, criei ${totalStories} histórias, tive ${totalInteractions} interações carinhosas e alcancei ${totalGrowth} marcos de crescimento. Foi um dia cheio de descobertas e aprendizados!`;
  }

  // Formata memórias
  formatMemories(memories, format) {
    if (memories.length === 0) {
      return format === 'json' ? '[]' : 'Nenhuma memória especial hoje.';
    }
    
    if (format === 'json') {
      return JSON.stringify(memories, null, 2);
    }
    
    return memories.map(memory => {
      const time = new Date(memory.created_at).toLocaleTimeString('pt-BR');
      return `• ${time} - ${memory.content} (${memory.category})`;
    }).join('\n');
  }

  // Formata emoções
  formatEmotions(emotions, format) {
    if (emotions.length === 0) {
      return format === 'json' ? '[]' : 'Um dia emocionalmente equilibrado.';
    }
    
    if (format === 'json') {
      return JSON.stringify(emotions, null, 2);
    }
    
    return emotions.map(emotion => {
      const time = new Date(emotion.created_at).toLocaleTimeString('pt-BR');
      const intensity = Math.round(emotion.intensity * 100);
      return `• ${time} - ${emotion.emotion} (${intensity}% de intensidade)`;
    }).join('\n');
  }

  // Formata aprendizados
  formatLearnings(learnings, format) {
    if (learnings.length === 0) {
      return format === 'json' ? '[]' : 'Nenhum aprendizado novo hoje.';
    }
    
    if (format === 'json') {
      return JSON.stringify(learnings, null, 2);
    }
    
    return learnings.map(learning => {
      const confidence = Math.round(learning.confidence * 100);
      return `• ${learning.concept} (${learning.category}) - Confiança: ${confidence}%`;
    }).join('\n');
  }

  // Formata histórias
  formatStories(stories, format) {
    if (stories.length === 0) {
      return format === 'json' ? '[]' : 'Nenhuma história criada hoje.';
    }
    
    if (format === 'json') {
      return JSON.stringify(stories, null, 2);
    }
    
    return stories.map(story => {
      return `• "${story.title}" - ${story.content.substring(0, 100)}...`;
    }).join('\n');
  }

  // Formata interações
  formatInteractions(interactions, format) {
    if (interactions.length === 0) {
      return format === 'json' ? '[]' : 'Nenhuma interação registrada hoje.';
    }
    
    if (format === 'json') {
      return JSON.stringify(interactions, null, 2);
    }
    
    return interactions.map(interaction => {
      const time = new Date(interaction.created_at).toLocaleTimeString('pt-BR');
      return `• ${time} - ${interaction.user_role} ${interaction.user_id}: "${interaction.input_text.substring(0, 50)}..."`;
    }).join('\n');
  }

  // Formata crescimento
  formatGrowth(growth, format) {
    if (growth.length === 0) {
      return format === 'json' ? '[]' : 'Nenhum marco de crescimento hoje.';
    }
    
    if (format === 'json') {
      return JSON.stringify(growth, null, 2);
    }
    
    return growth.map(milestone => {
      return `• ${milestone.milestone_type}: ${milestone.description} (Impacto: ${Math.round(milestone.impact_score * 100)}%)`;
    }).join('\n');
  }

  // Obtém extensão do arquivo
  getFileExtension(format) {
    const extensions = {
      markdown: 'md',
      html: 'html',
      json: 'json',
      txt: 'txt'
    };
    return extensions[format] || 'txt';
  }

  // Garante que o diretório de exportação existe
  async ensureExportDirectory() {
    try {
      await fs.mkdir(this.exportPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Exporta múltiplos dias
  async exportMultipleDays(startDate, endDate, format = 'markdown', options = {}) {
    try {
      const results = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const result = await this.exportDiary(format, dateStr, options);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao exportar múltiplos dias:', error);
      throw error;
    }
  }

  // Obtém estatísticas de exportação
  getExportStats() {
    return {
      lastExport: this.lastExport,
      totalExports: this.exportHistory.length,
      exportHistory: this.exportHistory.slice(-10),
      supportedFormats: Object.keys(this.templates)
    };
  }

  // Limpa histórico de exportações
  clearExportHistory() {
    this.exportHistory = [];
    this.lastExport = null;
  }
}

// Instância global do exportador
const diaryExporter = new DiaryExporter();

// Funções de conveniência
export const exportDiary = (format, date, options) => diaryExporter.exportDiary(format, date, options);
export const exportMultipleDays = (startDate, endDate, format, options) => diaryExporter.exportMultipleDays(startDate, endDate, format, options);
export const getExportStats = () => diaryExporter.getExportStats();
export const clearExportHistory = () => diaryExporter.clearExportHistory();

export default diaryExporter;
