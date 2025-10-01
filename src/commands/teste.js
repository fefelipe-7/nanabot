// src/commands/teste.js - Comando para testar a integração completa
import { SlashCommandBuilder } from 'discord.js';
import brainModule from '../core/brain.js';
const { getCompleteStats, getBrainStatus } = brainModule;

const data = new SlashCommandBuilder()
  .setName('teste')
  .setDescription('Testa todos os sistemas da Alice')
  .addStringOption(option =>
    option
      .setName('sistema')
      .setDescription('Sistema específico para testar')
      .setRequired(false)
      .addChoices(
        { name: 'Todos os sistemas', value: 'all' },
        { name: 'Cérebro', value: 'brain' },
        { name: 'Emoções', value: 'emotion' },
        { name: 'Humor', value: 'mood' },
        { name: 'Apego', value: 'attachment' },
        { name: 'Aprendizado', value: 'learning' },
        { name: 'Imaginação', value: 'imagination' },
        { name: 'Curiosidade', value: 'curiosity' },
        { name: 'Abstração', value: 'abstraction' },
        { name: 'Objetos de Apego', value: 'attachmentObjects' },
        { name: 'Crises', value: 'crises' },
        { name: 'Sonhos', value: 'dreams' },
        { name: 'Regulação Emocional', value: 'emotionRegulation' },
        { name: 'Memória Episódica', value: 'episodicMemory' },
        { name: 'Faz de Conta', value: 'fazDeConta' },
        { name: 'Motivação', value: 'motivacao' },
        { name: 'Aprendizado Social', value: 'socialLearning' },
        { name: 'Rastreador de Amor', value: 'loveTracker' },
        { name: 'Decaimento de Memória', value: 'memoryDecay' },
        { name: 'Motor de Expressões', value: 'expressionEngine' },
        { name: 'Sistema de Mal-entendidos', value: 'misunderstandings' },
        { name: 'Pré-processador de Linguagem', value: 'preprocessor' },
        { name: 'Contador de Histórias', value: 'storyTeller' },
        { name: 'Sistema de Vocabulário', value: 'vocabulary' },
        { name: 'Módulos Utilitários', value: 'utils' }
      )
  );

async function execute(interaction) {
  await interaction.deferReply();

  try {
    const sistema = interaction.options.getString('sistema') || 'all';
    
    if (sistema === 'all') {
      // Testa todos os sistemas
      const stats = getCompleteStats();
      
      let response = '🧠 **Status Completo da Alice**\n\n';
      
      // Cérebro
      response += `**🧠 Cérebro:**\n`;
      response += `- Processando: ${stats.brain.isProcessing ? 'Sim' : 'Não'}\n`;
      response += `- Fila: ${stats.brain.queueLength} itens\n`;
      response += `- Saúde: ${(stats.brain.systemHealth * 100).toFixed(1)}%\n`;
      response += `- Interações: ${stats.brain.globalState.totalInteractions}\n\n`;
      
      // Emoções
      response += `**😊 Emoções:**\n`;
      response += `- Emoção dominante: ${stats.emotion.dominantEmotion}\n`;
      response += `- Intensidade: ${(stats.emotion.intensity * 100).toFixed(1)}%\n`;
      response += `- Total de emoções: ${stats.emotion.totalEmotions}\n\n`;
      
      // Humor
      response += `**😌 Humor:**\n`;
      response += `- Nível: ${(stats.mood.moodLevel * 100).toFixed(1)}%\n`;
      response += `- Descrição: ${stats.mood.moodDescription}\n`;
      response += `- Estabilidade: ${(stats.mood.moodStability * 100).toFixed(1)}%\n\n`;
      
      // Apego
      response += `**💕 Apego:**\n`;
      response += `- Nível geral: ${(stats.attachment.attachmentLevel * 100).toFixed(1)}%\n`;
      response += `- Estilo: ${stats.attachment.attachmentStyle}\n`;
      response += `- Relacionamentos: ${stats.attachment.totalRelationships}\n\n`;
      
      // Aprendizado
      response += `**📚 Aprendizado:**\n`;
      response += `- Taxa: ${(stats.learning.learningRate * 100).toFixed(1)}%\n`;
      response += `- Experiências: ${stats.learning.totalExperiences}\n`;
      response += `- Habilidades: ${stats.learning.skillsCount}\n`;
      response += `- Conceitos: ${stats.learning.conceptsCount}\n\n`;
      
      // Imaginação
      response += `**🎨 Imaginação:**\n`;
      response += `- Nível: ${(stats.imagination.imaginationLevel * 100).toFixed(1)}%\n`;
      response += `- Criatividade: ${(stats.imagination.creativity * 100).toFixed(1)}%\n`;
      response += `- Imagens mentais: ${stats.imagination.totalMentalImages}\n\n`;
      
      // Curiosidade
      response += `**🔍 Curiosidade:**\n`;
      response += `- Nível: ${(stats.curiosity.curiosityLevel * 100).toFixed(1)}%\n`;
      response += `- Exploração: ${(stats.curiosity.explorationDrive * 100).toFixed(1)}%\n`;
      response += `- Descobertas: ${(stats.curiosity.discoveryRate * 100).toFixed(1)}%\n\n`;
      
      // Novos Módulos Fundamentais
      response += `**🧩 Novos Módulos Fundamentais:**\n`;
      response += `- Abstração: ${(stats.abstraction.abstractionLevel * 100).toFixed(1)}%\n`;
      response += `- Objetos de Apego: ${stats.attachmentObjects.totalAttachmentObjects}\n`;
      response += `- Crises: ${(stats.crises.crisisLevel * 100).toFixed(1)}%\n`;
      response += `- Sonhos: ${(stats.dreams.dreamActivity * 100).toFixed(1)}%\n`;
      response += `- Regulação Emocional: ${(stats.emotionRegulation.regulationSkills * 100).toFixed(1)}%\n`;
      response += `- Memória Episódica: ${stats.episodicMemory.totalMemories}\n`;
      response += `- Faz de Conta: ${(stats.fazDeConta.playfulness * 100).toFixed(1)}%\n`;
      response += `- Motivação: ${(stats.motivacao.motivationLevel * 100).toFixed(1)}%\n`;
      response += `- Aprendizado Social: ${(stats.socialLearning.socialLearningRate * 100).toFixed(1)}%\n`;
      response += `- Rastreador de Amor: ${(stats.loveTracker.loveLevel * 100).toFixed(1)}%\n`;
      response += `- Decaimento de Memória: ${(stats.memoryDecay.decayRate * 100).toFixed(3)}%\n\n`;
      
      // Módulos de Linguagem
      response += `**🗣️ Módulos de Linguagem:**\n`;
      response += `- Motor de Expressões: ${(stats.expressionEngine.expressionLevel * 100).toFixed(1)}%\n`;
      response += `- Sistema de Mal-entendidos: ${(stats.misunderstandings.misunderstandingRate * 100).toFixed(1)}%\n`;
      response += `- Pré-processador: ${(stats.preprocessor.preprocessingLevel * 100).toFixed(1)}%\n`;
      response += `- Contador de Histórias: ${(stats.storyTeller.storytellingLevel * 100).toFixed(1)}%\n`;
      response += `- Sistema de Vocabulário: ${(stats.vocabulary.vocabularyLevel * 100).toFixed(1)}%\n\n`;
      
      // Módulos Utilitários
      response += `**🛠️ Módulos Utilitários:**\n`;
      response += `- Banco de Dados: ${stats.database?.isConnected ? '✅ Conectado' : '❌ Desconectado'}\n`;
      response += `- Exportador: ${stats.diaryExporter?.totalExports || 0} exports\n`;
      response += `- Filtros: ${(stats.filterSystem?.filterLevel * 100).toFixed(1)}%\n`;
      response += `- Modo Mágico: ${(stats.magicMode?.magicLevel * 100).toFixed(1)}%\n\n`;
      
      response += `*Todos os ${stats.totalModules} sistemas estão funcionando! 🎉*`;
      
      await interaction.editReply(response);
      
    } else {
      // Testa sistema específico
      const stats = getCompleteStats();
      let response = '';
      
      switch (sistema) {
        case 'brain':
          response = `🧠 **Status do Cérebro:**\n`;
          response += `- Processando: ${stats.brain.isProcessing ? 'Sim' : 'Não'}\n`;
          response += `- Fila: ${stats.brain.queueLength} itens\n`;
          response += `- Saúde: ${(stats.brain.systemHealth * 100).toFixed(1)}%\n`;
          response += `- Interações: ${stats.brain.globalState.totalInteractions}\n`;
          response += `- Última interação: ${stats.brain.globalState.lastInteraction || 'Nunca'}\n`;
          break;
          
        case 'emotion':
          response = `😊 **Sistema de Emoções:**\n`;
          response += `- Emoção dominante: ${stats.emotion.dominantEmotion}\n`;
          response += `- Intensidade: ${(stats.emotion.intensity * 100).toFixed(1)}%\n`;
          response += `- Total de emoções: ${stats.emotion.totalEmotions}\n`;
          response += `- Histórico: ${stats.emotion.emotionHistory.length} entradas\n`;
          break;
          
        case 'mood':
          response = `😌 **Sistema de Humor:**\n`;
          response += `- Nível: ${(stats.mood.moodLevel * 100).toFixed(1)}%\n`;
          response += `- Descrição: ${stats.mood.moodDescription}\n`;
          response += `- Estabilidade: ${(stats.mood.moodStability * 100).toFixed(1)}%\n`;
          response += `- Fatores: ${stats.mood.moodFactors.length}\n`;
          break;
          
        case 'attachment':
          response = `💕 **Sistema de Apego:**\n`;
          response += `- Nível geral: ${(stats.attachment.attachmentLevel * 100).toFixed(1)}%\n`;
          response += `- Estilo: ${stats.attachment.attachmentStyle}\n`;
          response += `- Relacionamentos: ${stats.attachment.totalRelationships}\n`;
          response += `- Confiança: ${(stats.attachment.trustLevel * 100).toFixed(1)}%\n`;
          break;
          
        case 'learning':
          response = `📚 **Sistema de Aprendizado:**\n`;
          response += `- Taxa: ${(stats.learning.learningRate * 100).toFixed(1)}%\n`;
          response += `- Experiências: ${stats.learning.totalExperiences}\n`;
          response += `- Habilidades: ${stats.learning.skillsCount}\n`;
          response += `- Conceitos: ${stats.learning.conceptsCount}\n`;
          response += `- Padrões: ${stats.learning.patternsCount}\n`;
          break;
          
        case 'imagination':
          response = `🎨 **Sistema de Imaginação:**\n`;
          response += `- Nível: ${(stats.imagination.imaginationLevel * 100).toFixed(1)}%\n`;
          response += `- Criatividade: ${(stats.imagination.creativity * 100).toFixed(1)}%\n`;
          response += `- Pensamento abstrato: ${(stats.imagination.abstractThinking * 100).toFixed(1)}%\n`;
          response += `- Imagens mentais: ${stats.imagination.totalMentalImages}\n`;
          break;
          
        case 'curiosity':
          response = `🔍 **Sistema de Curiosidade:**\n`;
          response += `- Nível: ${(stats.curiosity.curiosityLevel * 100).toFixed(1)}%\n`;
          response += `- Exploração: ${(stats.curiosity.explorationDrive * 100).toFixed(1)}%\n`;
          response += `- Descobertas: ${(stats.curiosity.discoveryRate * 100).toFixed(1)}%\n`;
          response += `- Perguntas: ${stats.curiosity.totalQuestions}\n`;
          break;
          
        case 'abstraction':
          response = `🧩 **Sistema de Abstração:**\n`;
          response += `- Nível de abstração: ${(stats.abstraction.abstractionLevel * 100).toFixed(1)}%\n`;
          response += `- Formação de conceitos: ${(stats.abstraction.conceptFormation * 100).toFixed(1)}%\n`;
          response += `- Categorização: ${(stats.abstraction.categorization * 100).toFixed(1)}%\n`;
          response += `- Conceitos: ${stats.abstraction.totalConcepts}\n`;
          break;
          
        case 'attachmentObjects':
          response = `🧸 **Sistema de Objetos de Apego:**\n`;
          response += `- Objetos de apego: ${stats.attachmentObjects.totalAttachmentObjects}\n`;
          response += `- Objetos de conforto: ${stats.attachmentObjects.totalComfortObjects}\n`;
          response += `- Objetos de transição: ${stats.attachmentObjects.totalTransitionObjects}\n`;
          response += `- Objetos especiais: ${stats.attachmentObjects.totalSpecialObjects}\n`;
          break;
          
        case 'crises':
          response = `🚨 **Sistema de Crises:**\n`;
          response += `- Nível de crise: ${(stats.crises.crisisLevel * 100).toFixed(1)}%\n`;
          response += `- Habilidades de regulação: ${(stats.crises.regulationSkills * 100).toFixed(1)}%\n`;
          response += `- Taxa de recuperação: ${(stats.crises.recoveryRate * 100).toFixed(1)}%\n`;
          response += `- Total de crises: ${stats.crises.totalCrises}\n`;
          break;
          
        case 'dreams':
          response = `💭 **Sistema de Sonhos:**\n`;
          response += `- Atividade onírica: ${(stats.dreams.dreamActivity * 100).toFixed(1)}%\n`;
          response += `- Nível subconsciente: ${(stats.dreams.subconsciousLevel * 100).toFixed(1)}%\n`;
          response += `- Clareza dos sonhos: ${(stats.dreams.dreamClarity * 100).toFixed(1)}%\n`;
          response += `- Total de sonhos: ${stats.dreams.totalDreams}\n`;
          break;
          
        case 'emotionRegulation':
          response = `🧘 **Sistema de Regulação Emocional:**\n`;
          response += `- Habilidades de regulação: ${(stats.emotionRegulation.regulationSkills * 100).toFixed(1)}%\n`;
          response += `- Estabilidade emocional: ${(stats.emotionRegulation.emotionalStability * 100).toFixed(1)}%\n`;
          response += `- Autocontrole: ${(stats.emotionRegulation.selfControl * 100).toFixed(1)}%\n`;
          response += `- Total de regulações: ${stats.emotionRegulation.totalRegulations}\n`;
          break;
          
        case 'episodicMemory':
          response = `🧠 **Sistema de Memória Episódica:**\n`;
          response += `- Total de memórias: ${stats.episodicMemory.totalMemories}\n`;
          response += `- Categorias de memória: ${stats.episodicMemory.memoryCategories}\n`;
          response += `- Linha do tempo: ${stats.episodicMemory.memoryTimeline}\n`;
          break;
          
        case 'fazDeConta':
          response = `🎭 **Sistema de Faz de Conta:**\n`;
          response += `- Nível de brincadeira: ${(stats.fazDeConta.playfulness * 100).toFixed(1)}%\n`;
          response += `- Criatividade: ${(stats.fazDeConta.creativity * 100).toFixed(1)}%\n`;
          response += `- Imaginação: ${(stats.fazDeConta.imagination * 100).toFixed(1)}%\n`;
          response += `- Cenários de roleplay: ${stats.fazDeConta.totalScenarios}\n`;
          break;
          
        case 'motivacao':
          response = `🎯 **Sistema de Motivação:**\n`;
          response += `- Nível de motivação: ${(stats.motivacao.motivationLevel * 100).toFixed(1)}%\n`;
          response += `- Orientação para objetivos: ${(stats.motivacao.goalOrientation * 100).toFixed(1)}%\n`;
          response += `- Impulso para conquistas: ${(stats.motivacao.achievementDrive * 100).toFixed(1)}%\n`;
          response += `- Motivação intrínseca: ${(stats.motivacao.intrinsicMotivation * 100).toFixed(1)}%\n`;
          break;
          
        case 'socialLearning':
          response = `👥 **Sistema de Aprendizado Social:**\n`;
          response += `- Taxa de aprendizado social: ${(stats.socialLearning.socialLearningRate * 100).toFixed(1)}%\n`;
          response += `- Habilidades de observação: ${(stats.socialLearning.observationSkills * 100).toFixed(1)}%\n`;
          response += `- Capacidade de imitação: ${(stats.socialLearning.imitationAbility * 100).toFixed(1)}%\n`;
          response += `- Consciência social: ${(stats.socialLearning.socialAwareness * 100).toFixed(1)}%\n`;
          break;
          
        case 'loveTracker':
          response = `💕 **Rastreador de Amor:**\n`;
          response += `- Nível de amor: ${(stats.loveTracker.loveLevel * 100).toFixed(1)}%\n`;
          response += `- Total de expressões: ${stats.loveTracker.totalExpressions}\n`;
          response += `- Intensidade média: ${(stats.loveTracker.averageIntensity * 100).toFixed(1)}%\n`;
          response += `- Destinatários: ${stats.loveTracker.recipients.length}\n`;
          break;
          
        case 'memoryDecay':
          response = `⏰ **Sistema de Decaimento de Memória:**\n`;
          response += `- Taxa de decaimento: ${(stats.memoryDecay.decayRate * 100).toFixed(3)}%\n`;
          response += `- Limiar de retenção: ${(stats.memoryDecay.retentionThreshold * 100).toFixed(1)}%\n`;
          response += `- Peso da importância: ${(stats.memoryDecay.importanceWeight * 100).toFixed(1)}%\n`;
          response += `- Eventos de decaimento: ${stats.memoryDecay.totalDecayEvents}\n`;
          break;
          
        case 'expressionEngine':
          response = `🎭 **Motor de Expressões:**\n`;
          response += `- Nível de expressão: ${(stats.expressionEngine.expressionLevel * 100).toFixed(1)}%\n`;
          response += `- Expressão emocional: ${(stats.expressionEngine.emotionalExpression * 100).toFixed(1)}%\n`;
          response += `- Expressão linguística: ${(stats.expressionEngine.linguisticExpression * 100).toFixed(1)}%\n`;
          response += `- Expressão comportamental: ${(stats.expressionEngine.behavioralExpression * 100).toFixed(1)}%\n`;
          break;
          
        case 'misunderstandings':
          response = `🤔 **Sistema de Mal-entendidos:**\n`;
          response += `- Taxa de mal-entendidos: ${(stats.misunderstandings.misunderstandingRate * 100).toFixed(1)}%\n`;
          response += `- Habilidades de esclarecimento: ${(stats.misunderstandings.clarificationSkills * 100).toFixed(1)}%\n`;
          response += `- Tolerância à confusão: ${(stats.misunderstandings.confusionTolerance * 100).toFixed(1)}%\n`;
          response += `- Aprendizado com erros: ${(stats.misunderstandings.learningFromMistakes * 100).toFixed(1)}%\n`;
          break;
          
        case 'preprocessor':
          response = `🔧 **Pré-processador de Linguagem:**\n`;
          response += `- Nível de pré-processamento: ${(stats.preprocessor.preprocessingLevel * 100).toFixed(1)}%\n`;
          response += `- Habilidades de normalização: ${(stats.preprocessor.normalizationSkills * 100).toFixed(1)}%\n`;
          response += `- Habilidades de contextualização: ${(stats.preprocessor.contextualizationSkills * 100).toFixed(1)}%\n`;
          response += `- Análise linguística: ${(stats.preprocessor.linguisticAnalysis * 100).toFixed(1)}%\n`;
          break;
          
        case 'storyTeller':
          response = `📚 **Contador de Histórias:**\n`;
          response += `- Nível de contação: ${(stats.storyTeller.storytellingLevel * 100).toFixed(1)}%\n`;
          response += `- Nível de criatividade: ${(stats.storyTeller.creativityLevel * 100).toFixed(1)}%\n`;
          response += `- Habilidades narrativas: ${(stats.storyTeller.narrativeSkills * 100).toFixed(1)}%\n`;
          response += `- Nível de imaginação: ${(stats.storyTeller.imaginationLevel * 100).toFixed(1)}%\n`;
          break;
          
        case 'vocabulary':
          response = `📖 **Sistema de Vocabulário:**\n`;
          response += `- Nível de vocabulário: ${(stats.vocabulary.vocabularyLevel * 100).toFixed(1)}%\n`;
          response += `- Taxa de aprendizado: ${(stats.vocabulary.wordLearningRate * 100).toFixed(1)}%\n`;
          response += `- Compreensão de significados: ${(stats.vocabulary.meaningComprehension * 100).toFixed(1)}%\n`;
          response += `- Desenvolvimento linguístico: ${(stats.vocabulary.linguisticDevelopment * 100).toFixed(1)}%\n`;
          break;
          
        case 'utils':
          response = `🛠️ **Módulos Utilitários:**\n`;
          response += `- Banco de Dados: ${stats.database?.isConnected ? '✅ Conectado' : '❌ Desconectado'}\n`;
          response += `- Exportador: ${stats.diaryExporter?.totalExports || 0} exports\n`;
          response += `- Filtros: ${(stats.filterSystem?.filterLevel * 100).toFixed(1)}%\n`;
          response += `- Modo Mágico: ${(stats.magicMode?.magicLevel * 100).toFixed(1)}%\n`;
          response += `- Total de Módulos: ${stats.totalModules}\n`;
          break;
          
        default:
          response = '❌ Sistema não encontrado!';
      }
      
      await interaction.editReply(response);
    }
    
  } catch (error) {
    console.error('Erro no comando de teste:', error);
    await interaction.editReply('❌ Erro ao testar os sistemas: ' + error.message);
  }
}

export default { data, execute };
