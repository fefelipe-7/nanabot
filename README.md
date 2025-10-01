
# nanabot
nanabot é como uma filhinha digital de 4 anos: carinhosa, falante e cheia de energia para brincar e descobrir o mundo 
# Nanabot

## Estrutura do Projeto

```
nanabot/
├── src/
│   ├── core/
│   ├── brain/
│   ├── commands/
│   ├── events/
│   ├── tts/
│   ├── language/
│   ├── services/
│   ├── utils/
│   └── config/
├── data/
├── public/
├── .env
├── package.json
├── .gitignore
└── README.md
```

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```

2. Configure o arquivo `.env` na raiz com suas credenciais:
   ```env
   # Discord Bot Configuration
   DISCORD_TOKEN=seu_token_do_discord_aqui
   DISCORD_CLIENT_ID=1397043160261070848
   DISCORD_PUBLIC_KEY=c269a08282bc16a5df5d2c66a08f60200e9c299671dea71662a7c89d498d1098
   
   # OpenRouter API Configuration
   OPENROUTER_API_KEY=sua_chave_da_openrouter_aqui
   OPENROUTER_MODEL=nvidia/nemotron-nano-9b-v2:free
   ```

3. Inicie o bot:
   ```sh
   npm start
   ```

## Como usar o bot

### Sistema de Ativação
A Alice responde de duas formas:
- **Prefixo**: `n!` seguido da mensagem
- **Menção**: Mencionando a Alice `@Alice` seguido da mensagem

### Exemplos:
- `n! Olá Alice, como você está?`
- `@Alice Conta uma história para mim`

### Comandos Slash
A Alice possui comandos slash do Discord:
- `/ping` - Testa se a Alice está online
- `/teste` - Testa todos os sistemas da Alice
- `/reset` - Reseta o cérebro da Alice
- `/surpresa` - A Alice faz uma surpresa!
- `/filter` - Verifica status do filtro de mensagens
- `/api status` - Mostra estatísticas dos modelos de API
- `/api rotate` - Força rotação para o próximo modelo
- `/api reset` - Reseta estatísticas dos modelos
- `/config add-model` - Adiciona novo modelo à rotação
- `/config remove-model` - Remove modelo da rotação
- `/config list-models` - Lista todos os modelos configurados

### Sistema de Rotação de API
A Alice usa um sistema inteligente de rotação entre diferentes modelos de IA:

- **5 modelos diferentes** configurados por padrão
- **Rotação automática** baseada em uso e prioridade
- **Detecção de rate limits** e recuperação automática
- **Fallback inteligente** quando todos os modelos falham
- **Estatísticas em tempo real** de uso e performance

## Como contribuir
- Adicione novos comandos em `src/commands/`
- Adicione novos eventos em `src/events/`
- Consulte os módulos em `src/core/` e `src/brain/` para lógica de IA
- Use o logger de `src/utils/logger.js` para logs

## Sobre
A Nanabot é uma IA afetiva infantil que cresce, sente, aprende e se apega aos pais no Discord.
>>>>>>> 07fffd1 (ajustado arquivo .env)
