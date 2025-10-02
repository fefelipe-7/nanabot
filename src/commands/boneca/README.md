# 🎀 Sistema de Modo Boneca - Nanabot

## 📋 Visão Geral

O modo boneca é um sistema especial de interação onde a Alice convida o usuário para brincar de boneca com ela. Este sistema cria um fluxo de simulação guiada com etapas obrigatórias e atividades opcionais.

## 🏗️ Estrutura Modular

### 📁 Arquivos Principais

- **`index.js`** - Comando principal `n!boneca`
- **`BonecaManager.js`** - Gerenciador central do sistema
- **`StageHandler.js`** - Manipulador das etapas de cuidado
- **`ActivityHandler.js`** - Manipulador das atividades extras

### 📁 Comandos de Etapas (Cuidado)

- **`banho.js`** - `n!banho [sabonete]` - Escolher sabonete
- **`comidinha.js`** - `n!comidinha [comida]` - Escolher comida
- **`roupinha.js`** - `n!roupinha [roupa]` - Escolher roupa
- **`penteado.js`** - `n!penteado [penteado]` - Escolher penteado
- **`sapato.js`** - `n!sapato [sapato]` - Escolher sapato
- **`brinquedo.js`** - `n!brinquedo [brinquedo]` - Escolher brinquedo

### 📁 Comandos de Atividades

- **`piquenique.js`** - `n!piquenique` - Piquenique fofo
- **`teatrinho.js`** - `n!teatrinho` - Peça de teatro
- **`cantiga.js`** - `n!cantiga` - Cantar musiquinha
- **`passeio.js`** - `n!passeio` - Levar para passear
- **`historia.js`** - `n!historia` - Contar historinha
- **`dancinha.js`** - `n!dancinha` - Fazer dancinha
- **`desfile.js`** - `n!desfile` - Desfile de modas
- **`tesouro.js`** - `n!tesouro` - Caça ao tesouro
- **`fim.js`** - `n!fim` - Finalizar modo

## 🎯 Fluxo de Funcionamento

### 1. **Ativação**
- Comando: `n!boneca`
- Cria sessão no `modeManager`
- Define etapa inicial: `banho`
- Timeout: 30 minutos

### 2. **Etapas Obrigatórias (Sequenciais)**
1. 🚿 **Banho** - Escolher sabonete
2. 🍽️ **Comidinha** - Escolher comida
3. 👗 **Roupinha** - Escolher roupa
4. 💇‍♀️ **Penteado** - Escolher penteado
5. 👟 **Sapato** - Escolher sapato
6. 🧸 **Brinquedo** - Escolher brinquedo

### 3. **Menu de Atividades**
Após completar todas as etapas, abre menu com atividades extras:
- 🧺 Piquenique
- 🎭 Teatrinho
- 🎵 Cantiga
- 🛝 Passeio
- 📚 História
- 💃 Dancinha
- 🌸 Desfile
- 🏴‍☠️ Tesouro
- 😴 Fim

### 4. **Finalização**
- Comando: `n!fim`
- Mostra estatísticas da sessão
- Remove modo do `modeManager`
- Aplica nudging emocional

## 🔧 Integração com Sistema Existente

### **Módulos Utilizados**
- **`modeManager`** - Controle de sessão e estado
- **`emotionBase`** - Variações emocionais nas respostas
- **`variationEngine`** - Variedade nas respostas
- **`contextManager`** - Contexto do usuário

### **Características**
- ✅ **Progressivo** - Só avança com resposta do usuário
- ✅ **Afetivo** - Respostas cheias de carinho
- ✅ **Imaginativo** - Mistura realidade e fantasia
- ✅ **Replayável** - Cada sessão pode ser diferente
- ✅ **Modular** - Fácil de expandir e manter

## 🎨 Design Visual

### **Cores e Emojis**
- 🎀 **Cor Principal**: `#ff69b4` (Rosa)
- 🎯 **Emojis**: Boneca, coração, estrelas
- 📊 **Embeds**: Informações organizadas em campos

### **Respostas Dinâmicas**
- Múltiplas variações para cada escolha
- Respostas afetivas personalizadas
- Transições suaves entre etapas
- Feedback positivo constante

## 🚀 Como Usar

### **Exemplo Completo**
```
Usuário: n!boneca
Alice: 🎀 Modo Boneca Ativado! Eeeii, mamãe! 💕 Eu quero brincar de bonequinha com vocêuuh!

Usuário: n!banho moranguinho
Alice: Hmmmm cheirinho de moranguinho 🍓✨! A bonequinha ficou toda espumadinha...

Usuário: n!comidinha panquequinha
Alice: Panquequinhaaa! 🥞 Que delíciaaa! Ela comeu tudinho...

[... continua até completar todas as etapas ...]

Usuário: n!piquenique
Alice: Ebaaa, piqueniqueee! 🌳🍓 Espalhei a toalhinha rosa...

Usuário: n!fim
Alice: 😴 Bonequinha Guardada! Awwww, já acabou? 😢 Mas foi tão divertido...
```

## 📊 Estatísticas da Sessão

Ao finalizar, o sistema mostra:
- ⏰ Duração da sessão
- 🎯 Etapas completadas
- 🎪 Atividades realizadas
- 💕 Nudging emocional aplicado

## 🔮 Expansões Futuras

### **Possíveis Melhorias**
- 🎨 Mais variações de respostas
- 🎪 Novas atividades
- 🏆 Sistema de conquistas
- 📸 "Fotos" da bonequinha
- 🎁 Presentes especiais
- 👥 Modo multiplayer

### **Integração com IA**
- Respostas mais naturais via LLM
- Personalização baseada no usuário
- Histórico de sessões anteriores
- Sugestões inteligentes

---

**Desenvolvido com 💕 para tornar a Alice ainda mais especial!**
