import type { InteriorDefinition } from '../types';

export const INTERIOR_SIZE = { width: 820, height: 560 };

export const interiors: Record<string, InteriorDefinition> = {
  inn: {
    id: 'inn',
    name: 'Taverna Lua Cheia',
    subtitle: 'Cheiro de pão, madeira antiga e histórias mal contadas.',
    wall: 0x6f4734,
    floor: 0xc49a6c,
    accent: 0x9b4a3c,
    spawn: { x: 410, y: 475 },
    exit: { x: 410, y: 515 },
    objects: [
      { id:'counter', label:'Balcão', emoji:'🍲', text:'Panelas ainda quentes. Luma claramente começou o dia antes de todo mundo.', x:115,y:105,w:590,h:58, solid:true },
      { id:'notice', label:'Mural de recados', emoji:'📜', text:'“Procura-se ajuda para investigar ruídos no rio.” Alguém sublinhou a palavra ruídos três vezes.', x:670,y:205,w:55,h:90 },
      { id:'table-a', label:'Mesa', emoji:'🍞', text:'Uma caneca pela metade e migalhas de pão. Alguém saiu com pressa.', x:170,y:260,w:120,h:82, solid:true },
      { id:'table-b', label:'Mesa', emoji:'🍺', text:'Marcas riscadas na madeira contam dias. Ou dívidas.', x:525,y:260,w:120,h:82, solid:true },
    ],
  },
  smith: {
    id: 'smith',
    name: 'Forja do Bram',
    subtitle: 'O ar vibra com metal, carvão e calor.',
    wall: 0x394957,
    floor: 0x8f806d,
    accent: 0x425f76,
    spawn: { x: 410, y: 475 },
    exit: { x: 410, y: 515 },
    objects: [
      { id:'forge', label:'Forja', emoji:'🔥', text:'A forja está quente. Há pequenas partículas azuladas misturadas às cinzas.', x:115,y:100,w:180,h:125, solid:true },
      { id:'anvil', label:'Bigorna', emoji:'⚒️', text:'Uma lâmina inacabada repousa aqui. O metal tem um brilho incomum.', x:360,y:170,w:105,h:75, solid:true },
      { id:'rack', label:'Suporte de ferramentas', emoji:'🛠️', text:'Tudo está perfeitamente organizado, exceto um martelo que parece ter sido usado durante a madrugada.', x:610,y:95,w:90,h:180, solid:true },
      { id:'crate', label:'Caixa de minério', emoji:'🪨', text:'Minério comum... e uma pedra escura que parece vibrar muito levemente.', x:155,y:360,w:110,h:85, solid:true },
    ],
  },
  shop: {
    id: 'shop',
    name: 'Empório da Mira',
    subtitle: 'Tudo tem preço. Algumas coisas só não têm etiqueta.',
    wall: 0x53623f,
    floor: 0xd2b67e,
    accent: 0x607a47,
    spawn: { x: 410, y: 475 },
    exit: { x: 410, y: 515 },
    objects: [
      { id:'counter', label:'Balcão', emoji:'🧺', text:'O livro-caixa de Mira está aberto. Três entregas da estrada norte estão marcadas como atrasadas.', x:125,y:105,w:570,h:60, solid:true },
      { id:'shelf-a', label:'Prateleira', emoji:'🫙', text:'Conservas, ervas e um pote rotulado “não abrir depois da meia-noite”.', x:110,y:235,w:105,h:170, solid:true },
      { id:'shelf-b', label:'Prateleira', emoji:'📦', text:'Há um espaço vazio onde deveriam estar mercadorias vindas do norte.', x:605,y:235,w:105,h:170, solid:true },
      { id:'map', label:'Mapa de entregas', emoji:'🗺️', text:'Rotas comerciais cruzam toda Aster. A estrada norte termina perto do rio.', x:365,y:225,w:90,h:90 },
    ],
  },
  home: {
    id: 'home',
    name: 'Casa da Elena',
    subtitle: 'Pequena, acolhedora e cheia de plantas.',
    wall: 0x6b5a78,
    floor: 0xd6c5a0,
    accent: 0x755a92,
    spawn: { x: 410, y: 475 },
    exit: { x: 410, y: 515 },
    objects: [
      { id:'bed', label:'Cama', emoji:'🛏️', text:'A cama está arrumada. No criado-mudo há um livro sobre plantas que crescem perto de fontes mágicas.', x:120,y:110,w:190,h:105, solid:true },
      { id:'plants', label:'Plantas', emoji:'🌿', text:'Quase todas estão saudáveis. Uma muda trazida do rio está perdendo a cor.', x:595,y:100,w:95,h:145, solid:true },
      { id:'desk', label:'Escrivaninha', emoji:'📖', text:'Anotações de Elena: “Dia 4 — as flores reagiram ao tremor antes de nós.”', x:320,y:265,w:180,h:90, solid:true },
      { id:'tea', label:'Mesa de chá', emoji:'🫖', text:'Duas xícaras. Elena costuma esperar companhia.', x:135,y:350,w:125,h:85, solid:true },
    ],
  },
};
