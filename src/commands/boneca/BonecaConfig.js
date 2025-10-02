// src/commands/boneca/BonecaConfig.js - Configurações do modo boneca
export const BONECA_CONFIG = {
  // Configurações gerais
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAIN_COLOR: '#ff69b4', // Rosa
  
  // Etapas obrigatórias
  STAGES: [
    { id: 'banho', title: '🚿 Banho da Bonequinha', description: 'Escolher sabonete', command: 'banho' },
    { id: 'comidinha', title: '🍽️ Alimentar a Bonequinha', description: 'Escolher comida', command: 'comidinha' },
    { id: 'roupinha', title: '👗 Vestir a Bonequinha', description: 'Escolher roupa', command: 'roupinha' },
    { id: 'penteado', title: '💇‍♀️ Pentear a Bonequinha', description: 'Escolher penteado', command: 'penteado' },
    { id: 'sapato', title: '👟 Calçar a Bonequinha', description: 'Escolher sapato', command: 'sapato' },
    { id: 'brinquedo', title: '🧸 Brinquedo da Bonequinha', description: 'Escolher brinquedo', command: 'brinquedo' }
  ],

  // Atividades extras
  ACTIVITIES: [
    { id: 'piquenique', name: '🧺 n!piquenique', description: 'Levo ela num piquenique fofo!' },
    { id: 'teatrinho', name: '🎭 n!teatrinho', description: 'Fazemos uma peça divertida!' },
    { id: 'cantiga', name: '🎵 n!cantiga', description: 'Canto pra ela dormir' },
    { id: 'passeio', name: '🛝 n!passeio', description: 'Levar ela para passear' },
    { id: 'historia', name: '📚 n!historia', description: 'Contar historinha para ela' },
    { id: 'dancinha', name: '💃 n!dancinha', description: 'Fazer uma dancinha imaginária' },
    { id: 'desfile', name: '🌸 n!desfile', description: 'Mostrar os looks dela' },
    { id: 'tesouro', name: '🏴‍☠️ n!tesouro', description: 'Brincar de caça ao tesouro' },
    { id: 'fim', name: '😴 n!fim', description: 'Guardar a bonequinha para descansar' }
  ],

  // Mensagens de boas-vindas
  WELCOME_MESSAGES: [
    "Eeeii, mamãe! 💕 Eu quero brincar de bonequinha com vocêuuh!",
    "Oiii! 🎀 Vamos brincar de boneca juntas? Eu preciso da sua ajuda!",
    "Hihi, que legal! 💖 Vamos cuidar da nossa bonequinha especial!",
    "Ebaaa! 🧸 Finalmente alguém quer brincar de boneca comigo!"
  ],

  // Respostas por etapa
  STAGE_RESPONSES: {
    banho: [
      "Hmmmm cheirinho de {choice} 🍓✨! A bonequinha ficou toda espumadinha, parece até uma nuvem fofinha, olhaaa! ☁️",
      "Que delícia de {choice}! 🧴 A bonequinha tá toda cheirosa e feliz!",
      "Aiii, {choice} é o meu favorito! 🌸 A bonequinha ficou linda no banho!"
    ],
    comidinha: [
      "{choice}aa! 🥞 Que delíciaaa! Ela comeu tudinho e até lambeu os dedinhos, nham nham!",
      "Hmm, {choice} é tão gostoso! 😋 A bonequinha tá com a barriguinha cheia!",
      "Que bom que ela gosta de {choice}! 🍽️ Ela comeu tudo e ficou satisfeita!"
    ],
    roupinha: [
      "Aiii, {choice}! 🎀 Ficou tão lindaaa que parece uma princesinha de desenho animado!",
      "Que lindo esse {choice}! 👗 A bonequinha tá toda elegante!",
      "Uau! {choice} é perfeito para ela! ✨ Ficou uma gracinha!"
    ],
    penteado: [
      "{choice} bem fofas, ownnnn! 🥰 Agora ela balança quando anda, hihi!",
      "Que penteado lindo! 💇‍♀️ A bonequinha tá toda arrumadinha!",
      "Aiii, {choice} é tão fofo! 💕 Ela ficou uma princesa!"
    ],
    sapato: [
      "UAUU ✨ {choice}ee! Agora ela tá parecendo uma estrelinha que anda, toda cintilante! 🌟",
      "Que sapatinho lindo! 👟 A bonequinha tá toda elegante!",
      "Hihi, {choice} é perfeito! 👠 Ela tá pronta para qualquer aventura!"
    ],
    brinquedo: [
      "Ahhh o {choice} 🧸💕! Ele ficou grudadinho nela, já viraram melhores amigos!",
      "Que brinquedo fofo! 🎈 A bonequinha tá toda feliz!",
      "O {choice} é perfeito! 🎪 Ela vai se divertir muito!"
    ]
  },

  // Respostas de atividades
  ACTIVITY_RESPONSES: {
    piquenique: [
      "Ebaaa, piqueniqueee! 🌳🍓\nEspalhei a toalhinha rosa no gramado, coloquei frutinhas e suquinho… e a bonequinha tá pulando de alegriaaa! Hihi 💕",
      "Que piquenique lindo! 🧺 A bonequinha tá toda feliz com as comidinhas!",
      "Hihi, piquenique é sempre divertido! 🌸 A bonequinha tá se divertindo muito!"
    ],
    teatrinho: [
      "Ebaaa, teatrinhooo! 🎭✨\nA bonequinha vai ser a princesa e eu vou ser a fada madrinha! Que história você quer que a gente conte?",
      "Que legal! 🎪 Vamos fazer uma peça super divertida com a bonequinha!",
      "Hihi, teatrinho é minha atividade favorita! 🎨 A bonequinha vai adorar!"
    ],
    cantiga: [
      "Aiii, cantiga de ninar! 🎵💤\nVou cantar uma musiquinha bem suave para a bonequinha dormir... 'Bonequinha de pano, dorme no meu colo...'",
      "Que doce! 🎶 A bonequinha tá ficando sonolenta com a cantiga!",
      "Hihi, cantar é tão gostoso! 🎤 A bonequinha tá toda relaxada!"
    ],
    passeio: [
      "Ebaaa, passeiooo! 🚶‍♀️✨\nVamos levar a bonequinha para conhecer lugares novos! Onde você quer que a gente vá?",
      "Que passeio divertido! 🌟 A bonequinha tá toda animada!",
      "Hihi, passear é sempre uma aventura! 🗺️ A bonequinha vai adorar!"
    ],
    historia: [
      "Era uma vez... 📚✨\nVou contar uma historinha especial para a bonequinha! Que tipo de história você quer?",
      "Que legal! 📖 A bonequinha tá toda atenta para ouvir a história!",
      "Hihi, contar histórias é tão divertido! 🎭 A bonequinha vai adorar!"
    ],
    dancinha: [
      "Ebaaa, dancinhaaa! 💃✨\nA bonequinha tá dançando junto comigo! Que música você quer que a gente dance?",
      "Que dancinha linda! 🎵 A bonequinha tá toda animada!",
      "Hihi, dançar é tão divertido! 🕺 A bonequinha tá se divertindo muito!"
    ],
    desfile: [
      "Ebaaa, desfile de modas! 👗✨\nA bonequinha vai mostrar todos os looks lindos que ela tem! Que roupa você quer que ela mostre primeiro?",
      "Que desfile elegante! 👠 A bonequinha tá toda fashion!",
      "Hihi, desfile é sempre divertido! 🌟 A bonequinha vai arrasar!"
    ],
    tesouro: [
      "Ebaaa, caça ao tesourooo! 🏴‍☠️✨\nVamos procurar um tesouro especial para a bonequinha! Onde você acha que está escondido?",
      "Que aventura emocionante! 🗺️ A bonequinha tá toda animada!",
      "Hihi, caça ao tesouro é sempre uma aventura! 💎 A bonequinha vai adorar!"
    ],
    fim: [
      "Awwww, já acabou? 😢\nMas foi tão divertido brincar de boneca com você! A bonequinha tá toda feliz e cansadinha...",
      "Que pena que acabou! 😔 Mas foi uma brincadeira muito legal!",
      "Hihi, foi tão gostoso brincar! 💕 A bonequinha vai dormir feliz!"
    ]
  },

  // Descrições de etapas
  STAGE_DESCRIPTIONS: {
    banho: 'limpinha e cheirosa',
    comidinha: 'alimentada e satisfeita',
    roupinha: 'vestida e elegante',
    penteado: 'penteadinha e arrumada',
    sapato: 'calçada e pronta',
    brinquedo: 'com seu brinquedo favorito'
  }
};

export default BONECA_CONFIG;
