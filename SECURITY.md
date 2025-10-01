# 🔒 Política de Segurança - Alice Bot

## 📋 Índice
- [Reportar Vulnerabilidades](#reportar-vulnerabilidades)
- [Práticas de Segurança](#práticas-de-segurança)
- [Configuração Segura](#configuração-segura)
- [Monitoramento](#monitoramento)
- [Atualizações](#atualizações)
- [Contatos](#contatos)

## 🚨 Reportar Vulnerabilidades

### Como Reportar
Se você descobrir uma vulnerabilidade de segurança, **NÃO** abra uma issue pública. Em vez disso:

1. **Envie um email** para: `felipedejesusferreira01@gmail.com`
2. **Use o assunto:** `[SECURITY] Alice Bot - Vulnerabilidade`
3. **Inclua:**
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestões de correção (se houver)

### Processo de Resposta
- **24 horas:** Confirmação de recebimento
- **72 horas:** Avaliação inicial
- **7 dias:** Status update
- **30 dias:** Resolução ou timeline detalhada

## 🛡️ Práticas de Segurança

### 🔑 Gerenciamento de Chaves

#### Tokens Discord
```bash
# ✅ CORRETO
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz

# ❌ INCORRETO
DISCORD_TOKEN=seu_token_aqui
```

#### Chaves de API
```bash
# ✅ CORRETO
OPENROUTER_API_KEY=sk-or-v1-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# ❌ INCORRETO
OPENROUTER_API_KEY=minha_chave_secreta
```

### 🔐 Variáveis de Ambiente

#### Arquivo `.env` (NUNCA COMMITAR)
```bash
# Discord Bot
DISCORD_TOKEN=seu_token_discord_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_GUILD_ID=seu_guild_id_aqui

# OpenRouter API
OPENROUTER_API_KEY=sua_chave_openrouter_aqui

# Configurações
NODE_ENV=production
BOT_NAME=Alice
LOG_LEVEL=info
```

#### Arquivo `.env.example` (PODE COMMITAR)
```bash
# Discord Bot
DISCORD_TOKEN=your_discord_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Configurações
NODE_ENV=development
BOT_NAME=Alice
LOG_LEVEL=debug
```

### 🚫 Arquivos Sensíveis

#### `.gitignore` (OBRIGATÓRIO)
```gitignore
# Variáveis de ambiente
.env
.env.local
.env.production
.env.staging

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dados sensíveis
data/
*.db
*.sqlite
*.sqlite3

# Chaves e certificados
*.pem
*.key
*.crt
*.p12
*.pfx

# Configurações locais
config/local.json
config/production.json
```

## 🔧 Configuração Segura

### 🛡️ Permissões do Bot Discord

#### Permissões Mínimas Necessárias
```json
{
  "permissions": [
    "SEND_MESSAGES",
    "READ_MESSAGE_HISTORY",
    "USE_SLASH_COMMANDS",
    "EMBED_LINKS",
    "ATTACH_FILES"
  ]
}
```

#### Permissões Avançadas (Apenas se Necessário)
```json
{
  "permissions": [
    "MANAGE_MESSAGES",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR"
  ]
}
```

### 🔒 Rate Limiting

#### Configuração de Rate Limits
```javascript
// src/utils/apiRotator.js
const rateLimits = {
  maxRequests: 100,
  windowMs: 60000, // 1 minuto
  delayMs: 1000,   // 1 segundo entre requests
  backoffMs: 5000  // 5 segundos em caso de rate limit
};
```

#### Proteção contra Spam
```javascript
// src/modules/cooldownManager.js
const cooldowns = {
  default: 2000,    // 2 segundos
  commands: 5000,   // 5 segundos
  api: 1000        // 1 segundo
};
```

### 🛡️ Validação de Entrada

#### Sanitização de Mensagens
```javascript
// src/utils/sanitizer.js
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '')           // Remove HTML tags
    .replace(/javascript:/gi, '')    // Remove JavaScript
    .replace(/on\w+=/gi, '')        // Remove event handlers
    .trim()
    .substring(0, 2000);           // Limita tamanho
}
```

#### Validação de Comandos
```javascript
// src/utils/validator.js
function validateCommand(command, args) {
  const allowedCommands = ['ping', 'help', 'status'];
  const maxArgs = 10;
  
  if (!allowedCommands.includes(command)) {
    throw new Error('Comando não permitido');
  }
  
  if (args.length > maxArgs) {
    throw new Error('Muitos argumentos');
  }
  
  return true;
}
```

## 📊 Monitoramento

### 🔍 Logs de Segurança

#### Configuração de Logs
```javascript
// src/utils/securityLogger.js
const securityEvents = [
  'unauthorized_access',
  'rate_limit_exceeded',
  'invalid_command',
  'api_error',
  'suspicious_activity'
];

function logSecurityEvent(event, details) {
  console.log(`[SECURITY] ${new Date().toISOString()} - ${event}:`, details);
}
```

#### Monitoramento de Atividade
```javascript
// src/modules/activityMonitor.js
const suspiciousPatterns = [
  'mass_commands',      // Muitos comandos em sequência
  'invalid_tokens',     // Tokens inválidos
  'api_abuse',         // Abuso da API
  'unusual_hours'      // Atividade em horários estranhos
];
```

### 🚨 Alertas de Segurança

#### Configuração de Alertas
```javascript
// src/modules/securityAlerts.js
const alertThresholds = {
  failedLogins: 5,        // 5 tentativas falhadas
  rateLimitHits: 10,      // 10 rate limits
  suspiciousCommands: 20, // 20 comandos suspeitos
  apiErrors: 50          // 50 erros de API
};
```

## 🔄 Atualizações

### 📦 Dependências

#### Verificação Regular
```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated
```

#### Atualizações Automáticas
```json
// package.json
{
  "scripts": {
    "security-check": "npm audit --audit-level=moderate",
    "update-deps": "npm update",
    "check-outdated": "npm outdated"
  }
}
```

### 🔄 Atualizações do Bot

#### Versionamento
```javascript
// src/config/version.js
export const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: '2024-01-01'
};
```

#### Changelog de Segurança
```markdown
# CHANGELOG-SECURITY.md

## [1.0.1] - 2024-01-15
### Security
- Corrigida vulnerabilidade de rate limiting
- Melhorada validação de entrada
- Adicionado monitoramento de atividade

## [1.0.0] - 2024-01-01
### Initial Release
- Implementação inicial de segurança
- Rate limiting básico
- Validação de comandos
```

## 📞 Contatos

### 👥 Equipe de Segurança
- **Responsável:** [Seu Nome]
- **Email:** security@example.com
- **Discord:** [Seu Username]#[Seu Discriminator]

### 🔗 Recursos Adicionais
- [Discord.js Security Guide](https://discord.js.org/#/docs/discord.js/main/general-topics/security)
- [OpenRouter API Security](https://openrouter.ai/docs)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### 📋 Checklist de Segurança

#### ✅ Antes do Deploy
- [ ] Todas as chaves estão em variáveis de ambiente
- [ ] Arquivo `.env` está no `.gitignore`
- [ ] Rate limits configurados
- [ ] Logs de segurança ativados
- [ ] Dependências atualizadas
- [ ] Testes de segurança executados

#### ✅ Após o Deploy
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados
- [ ] Alertas configurados
- [ ] Backup de dados
- [ ] Plano de resposta a incidentes

---

**⚠️ IMPORTANTE:** Este documento deve ser revisado regularmente e atualizado conforme novas vulnerabilidades são descobertas ou novas práticas de segurança são implementadas.

**📅 Última atualização:** 2024-01-01
**🔄 Próxima revisão:** 2024-04-01
