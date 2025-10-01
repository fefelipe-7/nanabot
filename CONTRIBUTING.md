# Contribuindo para o Nanabot

Olá! 😺 Obrigado por querer contribuir com o Nanabot! Este guia vai te mostrar como colaborar de forma organizada e segura.

## 📋 Regras Gerais

- Seja gentil e respeitoso nas discussões e comentários
- Antes de criar um PR, verifique se já não existe algo similar
- Sempre atualize seu fork e branch antes de fazer mudanças
- **Nunca** commit arquivos sensíveis (tokens, senhas, `.env`, etc.)

## 🌿 Branches

- **`main`** → branch principal, sempre deployável
- **`dev`** → branch de desenvolvimento geral

Para features ou correções, crie branches no formato:

```bash
feature/nome-da-feature
fix/descrição-do-bug
```

## 💾 Padrão de Commits

Usamos **Conventional Commits**:

```
<tipo>[escopo opcional]: <descrição curta>
```

### Tipos recomendados:

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Ajustes de infraestrutura, configs ou docs |
| `docs` | Alterações na documentação |
| `refactor` | Refatoração de código sem alterar comportamento |
| `style` | Ajustes de estilo ou formatação |
| `test` | Inclusão ou correção de testes |

### Exemplos:

```bash
feat(commands): adicionar comando de abraçar
fix(core): corrigir bug no tracker de amor
chore: atualizar .gitignore
```

## 🔄 Padrão de Push

Sempre faça pull antes de push:

```bash
git pull origin dev --rebase
```

Push para seu branch de feature/fix:

```bash
git push origin feature/nome-da-feature
```

## 💻 Código

- Siga o padrão ESLint + Prettier (caso o projeto use)
- Comente funções complexas
- Mantenha o estilo consistente:
  - `camelCase` para variáveis
  - `PascalCase` para classes

## 🔒 Arquivos Sensíveis

**NUNCA** commite:

- `.env`
- `data/conversation_memory.db`
- `data/cooldowns.db`
- `node_modules/`

Esses arquivos devem estar no `.gitignore`.

## 🔀 Pull Requests

- Crie PR para a branch **`dev`**
- Explique claramente o que a mudança faz
- Referencie issues relacionadas (ex: `closes #12`)
- Aguarde revisão e feedback antes de mergear

## 🧪 Testes

- Sempre teste suas mudanças localmente
- Comandos novos devem ter exemplos de uso
- Evite quebrar comandos existentes

## 📜 Licença

Ao contribuir, você concorda que suas alterações serão licenciadas sob **Apache 2.0** (mesma licença do projeto).

---

*Obrigado por contribuir para tornar o Nanabot ainda melhor! 🎉*
