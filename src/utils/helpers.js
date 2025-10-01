/**
 * Mapeia o ID do usuário para o papel (mamãe, papai, outro papai).
 * @param {string} userId
 * @returns {string} papel do usuário
 */
function getUserRole(userId) {
  switch (userId) {
    case '787524878642577429':
      return 'mamãe';
    case '1276314597967532124':
      return 'papai';
    case '1339376778778644593':
      return 'outro de papai';
    default:
      return 'amiguinho';
  }
}

export { getUserRole };
