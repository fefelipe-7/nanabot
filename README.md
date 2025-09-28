
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
   OPENROUTER_MODEL=anthropic/claude-3-haiku
   ```

3. Inicie o bot:
   ```sh
   npm start
   ```

## Como usar o bot

### Sistema de Ativação
O bot responde de duas formas:
- **Prefixo**: `n!` seguido da mensagem
- **Menção**: Mencionando o bot `@Nanabot` seguido da mensagem

### Exemplos:
- `n! Olá, como você está?`
- `@Nanabot Conta uma história para mim`

### Comandos Slash
O bot também possui comandos slash do Discord:
- `/ping` - Testa a latência
- `/teste` - Testa a integração dos sistemas
- `/utils` - Testa módulos utilitários
- `/reset` - Reseta o cérebro da Nanabot

## Como contribuir
- Adicione novos comandos em `src/commands/`
- Adicione novos eventos em `src/events/`
- Consulte os módulos em `src/core/` e `src/brain/` para lógica de IA
- Use o logger de `src/utils/logger.js` para logs

## Sobre
A Nanabot é uma IA afetiva infantil que cresce, sente, aprende e se apega aos pais no Discord.
>>>>>>> 07fffd1 (ajustado arquivo .env)
