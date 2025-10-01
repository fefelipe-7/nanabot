
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
2. Configure o arquivo `.env` na raiz com seu token do Discord:
   ```env
   DISCORD_TOKEN=seu_token_aqui
   ```
3. Inicie o bot:
   ```sh
   npm start
   ```

## Como contribuir
- Adicione novos comandos em `src/commands/`
- Adicione novos eventos em `src/events/`
- Consulte os módulos em `src/core/` e `src/brain/` para lógica de IA
- Use o logger de `src/utils/logger.js` para logs

## Sobre
A Nanabot é uma IA afetiva infantil que cresce, sente, aprende e se apega aos pais no Discord.
>>>>>>> 07fffd1 (ajustado arquivo .env)
