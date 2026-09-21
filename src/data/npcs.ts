import type { NpcDefinition } from '../types';

export const npcDefinitions: NpcDefinition[] = [
  {
    id: 'elena', name: 'Elena', emoji: '🌸', role: 'Jardineira', color: 0xd782a7, x: 520, y: 860,
    intro: 'Oi! Você é novo por aqui, não é? Eu sou Elena. Cuido das flores da vila... e tento cuidar das pessoas também.',
    remembered: 'Você voltou! Eu sabia que aquele olhar curioso não era só de passagem.',
    topic: 'Ultimamente as flores perto do rio estão murchando rápido demais. Bram diz que é bobagem, mas eu acho estranho.',
    schedule: [
      { from: 0, to: 420, x: 310, y: 930, label: 'dormindo em casa' },
      { from: 420, to: 720, x: 520, y: 860, label: 'cuidando das flores' },
      { from: 720, to: 1020, x: 700, y: 650, label: 'na praça' },
      { from: 1020, to: 1260, x: 335, y: 700, label: 'caminhando perto de casa' },
      { from: 1260, to: 1440, x: 310, y: 930, label: 'em casa' },
    ],
  },
  {
    id: 'bram', name: 'Bram', emoji: '🧔', role: 'Ferreiro', color: 0xa8673f, x: 1020, y: 430,
    intro: 'Se veio atrás de espada, ainda não estou vendendo. Se veio conversar... bom, posso abrir uma exceção.',
    remembered: 'Ah, é você de novo. Já está começando a parecer morador.',
    topic: 'Ouvi um barulho vindo das pedras perto do rio ontem à noite. Metal raspando em pedra. Não gostei nada disso.',
    schedule: [
      { from: 0, to: 480, x: 1000, y: 330, label: 'na forja' },
      { from: 480, to: 1020, x: 1020, y: 430, label: 'trabalhando na forja' },
      { from: 1020, to: 1200, x: 760, y: 660, label: 'na taverna' },
      { from: 1200, to: 1440, x: 1000, y: 330, label: 'fechando a forja' },
    ],
  },
  {
    id: 'mira', name: 'Mira', emoji: '🧺', role: 'Comerciante', color: 0x7cab6a, x: 1510, y: 455,
    intro: 'Bem-vindo ao Empório da Mira! Aqui eu vendo de tudo — menos segredos. Esses custam mais caro.',
    remembered: 'Olha só quem voltou. Já separo alguma coisa ou você veio caçar fofoca?',
    topic: 'Algumas entregas não chegaram esta semana. A estrada do norte anda estranha.',
    schedule: [
      { from: 0, to: 450, x: 1515, y: 350, label: 'no empório' },
      { from: 450, to: 1080, x: 1510, y: 455, label: 'atendendo no empório' },
      { from: 1080, to: 1260, x: 1230, y: 640, label: 'na praça' },
      { from: 1260, to: 1440, x: 1515, y: 350, label: 'em casa' },
    ],
  },
  {
    id: 'theo', name: 'Theo', emoji: '🎣', role: 'Pescador', color: 0x5c8ec7, x: 1125, y: 845,
    intro: 'Shhh... quase peguei um enorme. Você espanta peixe andando desse jeito.',
    remembered: 'Você de novo! Pelo menos hoje os peixes já sabem que você faz barulho.',
    topic: 'A água mudou de gosto. Eu sei, eu sei... quem prova água do rio? Um pescador preocupado.',
    schedule: [
      { from: 0, to: 540, x: 720, y: 920, label: 'descansando' },
      { from: 540, to: 900, x: 1125, y: 845, label: 'pescando' },
      { from: 900, to: 1110, x: 710, y: 640, label: 'na praça' },
      { from: 1110, to: 1440, x: 780, y: 930, label: 'voltando para casa' },
    ],
  },
  {
    id: 'luma', name: 'Luma', emoji: '🍲', role: 'Taverneira', color: 0xcf7654, x: 500, y: 470,
    intro: 'Entre, sente, coma alguma coisa... quer dizer, quando tivermos interiores. Por enquanto aceite uma boa conversa.',
    remembered: 'Ora, meu cliente favorito sem conta aberta voltou.',
    topic: 'Todo mundo anda falando do rio. Quando cinco pessoas contam versões diferentes da mesma coisa, normalmente existe uma sexta versão escondida.',
    schedule: [
      { from: 0, to: 480, x: 480, y: 330, label: 'na taverna' },
      { from: 480, to: 960, x: 500, y: 470, label: 'trabalhando na taverna' },
      { from: 960, to: 1140, x: 760, y: 650, label: 'conversando na praça' },
      { from: 1140, to: 1440, x: 480, y: 330, label: 'fechando a taverna' },
    ],
  },
];
