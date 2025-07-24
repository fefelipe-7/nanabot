// Função para estilizar respostas da Nanabot
export function formatReply(text) {
  if (!text) return '';
  // Quebra linha antes e depois de ações entre asteriscos
  let formatted = text.replace(/(\*[^*]+\*)/g, '\n$1\n');
  // Remove múltiplas quebras de linha seguidas
  formatted = formatted.replace(/\n{2,}/g, '\n');
  // Deixa tudo em minúsculas
  formatted = formatted.toLowerCase();
  // Remove espaços extras nas bordas
  return formatted.trim();
}
