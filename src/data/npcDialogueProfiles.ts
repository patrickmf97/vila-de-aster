export interface NpcDialogueProfile {
  background: string[];
  dreams: string[];
  worries: string[];
  leisure: string[];
  favoritePlaces: string[];
  values: string[];
  workFeelings: string[];
  trustedConfessions: string[];
}

export const npcDialogueProfiles: Record<string, NpcDialogueProfile> = {
  elena: {
    background: [
      'Cresci cercada por plantas e aprendi cedo que a vila muda primeiro nas coisas pequenas.',
      'Comecei ajudando nos jardins de outras pessoas. Quando percebi, cuidar das flores já tinha virado meu trabalho.',
      'Sempre vivi perto daqui. Conheço as estações de Aster quase pelo cheiro do vento.',
    ],
    dreams: [
      'Quero transformar uma parte da vila num jardim comunitário onde qualquer família possa cultivar alguma coisa.',
      'Um dia eu gostaria de catalogar todas as plantas que crescem perto do rio.',
      'Meu sonho é ver Aster crescer sem perder os pequenos lugares que fazem ela parecer casa.',
    ],
    worries: [
      'O que mais me preocupa é quando alguma coisa muda na natureza e ninguém presta atenção.',
      'Tenho medo de a vila crescer rápido demais e esquecer por que as pessoas gostam de viver aqui.',
      'As flores perto do rio têm me deixado inquieta. Planta costuma perceber problema antes da gente.',
    ],
    leisure: [
      'Quando não estou trabalhando, gosto de caminhar sem destino e reparar no que mudou.',
      'Gosto de fazer chá e ler perto da janela.',
      'Se sobra tempo, tento cultivar alguma coisa que nunca plantei antes.',
    ],
    favoritePlaces: [
      'Gosto da parte mais tranquila perto de casa. No fim da tarde a luz fica bonita por ali.',
      'A praça é boa para observar a vila, mas meu lugar favorito ainda é qualquer canto com flores.',
      'Tem um trecho do caminho perto do rio que era muito bonito antes de as plantas começarem a mudar.',
    ],
    values: [
      'Para mim, cuidar de alguma coisa significa perceber quando ela precisa de atenção antes de pedir.',
      'Eu valorizo gentileza e curiosidade. As duas juntas resolvem muita coisa.',
      'Acho que uma vila só funciona quando as pessoas se importam com problemas que não são só delas.',
    ],
    workFeelings: [
      'Gosto do meu trabalho. Ver alguma coisa crescer porque você cuidou dela dá uma sensação difícil de explicar.',
      'Tem dias cansativos, mas eu não trocaria as plantas por um balcão ou uma forja.',
      'O trabalho me acalma. Mesmo quando a vila está estranha, terra e água continuam exigindo paciência.',
    ],
    trustedConfessions: [
      'Às vezes eu finjo estar menos preocupada com o rio do que realmente estou. Não quero assustar todo mundo sem ter certeza.',
      'Eu guardo anotações sobre as mudanças nas plantas. Algumas datas coincidem demais com os tremores.',
      'Tenho medo de descobrir alguma coisa sobre o rio e perceber que ninguém aqui está preparado para lidar com ela.',
    ],
  },
  bram: {
    background: [
      'Aprendi o ofício com um ferreiro que acreditava que ferramenta mal feita dizia mais sobre o artesão do que sobre o metal.',
      'Passei boa parte da juventude viajando entre oficinas antes de decidir ficar em Aster.',
      'A forja começou pequena. Fui melhorando uma coisa por vez, do mesmo jeito que faço com qualquer peça.',
    ],
    dreams: [
      'Quero deixar uma oficina que continue funcionando mesmo quando eu não puder mais levantar um martelo.',
      'Ainda quero fabricar uma peça que valha a pena ser lembrada daqui a cinquenta anos.',
      'Gostaria de treinar alguém que leve o ofício tão a sério quanto eu.',
    ],
    worries: [
      'Improviso demais me preocupa. Principalmente quando envolve coisa que ninguém entende direito.',
      'O som das pedras perto do rio não parece natural. Isso me incomoda mais do que admito.',
      'Tenho receio de que a vila dependa demais de poucas pessoas para coisas essenciais.',
    ],
    leisure: [
      'Descanso, para mim, costuma signific fazer alguma coisa menor com as mãos.',
      'Gosto de silêncio. Depois de um dia inteiro de martelo, silêncio é luxo.',
      'Às vezes vou até a taverna só para ouvir gente falando de coisas que não envolvem metal.',
    ],
    favoritePlaces: [
      'Minha oficina. Pode não parecer confortável para você, mas cada ferramenta está exatamente onde deveria.',
      'Gosto da taverna quando não está lotada.',
      'O trecho de estrada ao norte é bom para caminhar quando preciso organizar a cabeça.',
    ],
    values: [
      'Responsabilidade. Se você diz que vai fazer, faça direito.',
      'Confiança demora para construir e quebra mais rápido que metal mal temperado.',
      'Prefiro uma verdade desagradável a uma história bonita que não serve para nada.',
    ],
    workFeelings: [
      'Eu gosto do que faço. Metal exige atenção completa; isso mantém a cabeça limpa.',
      'É cansativo, mas existe satisfação em entregar algo que vai durar anos.',
      'Não sou bom parado. A forja me dá propósito.',
    ],
    trustedConfessions: [
      'Já encontrei material perto do rio que não reage ao calor como deveria. Guardei uma amostra.',
      'O barulho que ouvi naquela noite me lembrou uma oficina, mas não havia ninguém trabalhando perto da água.',
      'Tenho evitado falar muito sobre o que encontrei porque não quero criar pânico baseado em uma suspeita.',
    ],
  },
  mira: {
    background: [
      'Cresci vendo mercadoria chegar de lugares que eu nem sabia apontar num mapa. Acho que foi daí que veio minha curiosidade.',
      'Comecei negociando coisas pequenas e descobri que gosto tanto de entender pessoas quanto de entender preços.',
      'O empório foi a primeira coisa que eu construí que realmente parecia minha.',
    ],
    dreams: [
      'Quero transformar o empório no ponto comercial mais importante desta parte do vale.',
      'Um dia eu ainda vou conhecer pessoalmente todas as cidades que aparecem nos meus mapas de entrega.',
      'Gostaria de ver Aster produzindo mais coisas próprias em vez de depender tanto das estradas.',
    ],
    worries: [
      'Quando mercadoria para de chegar, o problema nunca fica só no estoque.',
      'A estrada norte me preocupa. Atraso repetido geralmente significa que alguém está escondendo um problema.',
      'Tenho medo de uma crise pegar a vila despreparada.',
    ],
    leisure: [
      'Eu sei que parece trabalho, mas gosto de organizar mapas e planejar rotas.',
      'Adoro ouvir histórias de viajantes. Principalmente quando sei separar exagero de informação útil.',
      'Quando consigo parar, gosto de comer alguma coisa na taverna sem olhar para um livro-caixa.',
    ],
    favoritePlaces: [
      'Meu empório, obviamente. De trás do balcão eu vejo metade da vila passar.',
      'Gosto da praça em horário movimentado. Informação anda melhor quando as pessoas se encontram.',
      'A taverna é praticamente um segundo mercado, só que a moeda são histórias.',
    ],
    values: [
      'Informação vale tanto quanto mercadoria.',
      'Eu valorizo independência. Pessoa ou vila que depende demais dos outros acaba pagando caro.',
      'Negócio bom é aquele em que ninguém precisa mentir sobre o que recebeu.',
    ],
    workFeelings: [
      'Gosto muito do comércio. Cada entrega é um pequeno quebra-cabeça.',
      'Tem dia em que eu gostaria que as pessoas viessem com etiqueta de preço e instruções.',
      'O melhor do empório é que tudo passa por aqui: comida, ferramenta, notícia e problema.',
    ],
    trustedConfessions: [
      'Algumas entregas desaparecidas tinham origem diferente, mas todas passariam perto do mesmo trecho do rio.',
      'Eu tenho uma reserva escondida de suprimentos. Se a estrada fechar, consigo manter algumas famílias por poucos dias.',
      'Parte de mim está preocupada; outra parte está calculando o que a vila precisaria para sobreviver isolada.',
    ],
  },
  theo: {
    background: [
      'Aprendi a pescar antes de aprender a escrever direito. O rio sempre fez parte da minha vida.',
      'Minha família sempre viveu perto da água. Eu só continuei fazendo o que parecia natural.',
      'Já passei temporadas pescando longe daqui, mas sempre acabei voltando para Aster.',
    ],
    dreams: [
      'Quero conhecer o rio inteiro, desde a nascente até onde ele deixa o vale.',
      'Um dia eu gostaria de ensinar alguém a pescar sem transformar tudo em competição.',
      'Meu sonho mais simples é poder continuar vivendo do rio sem precisar ter medo dele.',
    ],
    worries: [
      'Peixe muda de comportamento antes de muita coisa ruim acontecer. Ultimamente eles estão estranhos.',
      'Tenho medo de o rio deixar de ser seguro antes de entendermos o motivo.',
      'O que me preocupa não é um peixe ruim ou um dia sem captura. É quando todo o padrão muda.',
    ],
    leisure: [
      'Eu pesco até quando não preciso pescar. Então talvez eu seja ruim em separar trabalho de descanso.',
      'Gosto de ficar perto da água sem fazer nada. Só ouvir.',
      'Quando não estou no rio, normalmente acabo na praça conversando com alguém.',
    ],
    favoritePlaces: [
      'A margem perto da ponte. É onde eu percebo mais rápido quando a corrente muda.',
      'Minha casa fica perto o bastante do rio para eu ouvir a água à noite. Gosto disso.',
      'Tem um ponto mais afastado onde quase ninguém vai. É o melhor lugar para pensar.',
    ],
    values: [
      'Paciência. Quem tenta forçar o rio volta para casa frustrado.',
      'Eu valorizo lealdade. Gente que aparece só quando precisa de alguma coisa cansa rápido.',
      'Acho importante saber quando insistir e quando deixar algo quieto.',
    ],
    workFeelings: [
      'Gosto de pescar. Nem todo dia é bom, mas cada dia ensina alguma coisa.',
      'O trabalho depende mais de observar do que de força.',
      'Ultimamente a pesca está menos tranquila. O rio está diferente.',
    ],
    trustedConfessions: [
      'Eu provei a água porque o cheiro estava estranho. Sei que parece absurdo, mas ela realmente mudou.',
      'Vi movimento perto das pedras numa hora em que ninguém deveria estar lá.',
      'Ainda não contei para todo mundo, mas alguns peixes estão aparecendo com marcas que nunca vi antes.',
    ],
  },
  luma: {
    background: [
      'Trabalho em taverna desde muito nova. Aprendi cedo que servir comida também significa saber ouvir.',
      'A Lua Cheia começou como um lugar bem menor. A vila foi crescendo em volta dela.',
      'Já pensei em ir embora algumas vezes, mas sempre acontece alguma coisa que me lembra por que fiquei.',
    ],
    dreams: [
      'Quero ampliar a taverna e criar quartos suficientes para receber viajantes sem mandar ninguém dormir perto do balcão.',
      'Gostaria de transformar a Lua Cheia num lugar conhecido fora de Aster.',
      'Meu sonho é que ninguém da vila precise jantar sozinho se não quiser.',
    ],
    worries: [
      'Quando todo mundo chega contando uma versão diferente do mesmo problema, normalmente a verdade é pior que qualquer versão.',
      'Me preocupa ver moradores evitando falar do rio como se silêncio fosse resolver alguma coisa.',
      'Eu noto quando as pessoas param de aparecer. Ultimamente alguns viajantes sumiram da rotina da estrada.',
    ],
    leisure: [
      'Minha ideia de lazer é cozinhar alguma coisa que não está no cardápio.',
      'Gosto de ouvir música quando aparece alguém capaz de tocar sem espantar os clientes.',
      'Quando consigo fechar cedo, sento na praça e aproveito o fato de ninguém estar me pedindo comida.',
    ],
    favoritePlaces: [
      'A taverna, principalmente antes de abrir. É o único momento em que ela fica realmente silenciosa.',
      'Gosto da praça no fim da tarde.',
      'Minha mesa favorita fica num canto onde consigo ouvir três conversas sem parecer que estou ouvindo nenhuma.',
    ],
    values: [
      'Hospitalidade não é sorrir o tempo todo. É fazer alguém sentir que pode ficar.',
      'Eu valorizo comunidade. A vila funciona porque as pessoas aparecem umas para as outras.',
      'Segredo demais faz mal. Mas contar tudo para todo mundo também.',
    ],
    workFeelings: [
      'Eu gosto da taverna. É cansativo, mas nunca é igual dois dias seguidos.',
      'O melhor do trabalho são as pessoas. O pior também.',
      'Cozinhar é a parte fácil. Administrar histórias, brigas e contas é que dá trabalho.',
    ],
    trustedConfessions: [
      'Tenho anotado quais histórias sobre o rio se repetem. Algumas pessoas que nunca conversaram entre si contam os mesmos detalhes.',
      'Existe um cliente que aparecia sempre na mesma noite da semana. Parou de vir pouco antes dos tremores.',
      'Eu sei mais fofoca do que deveria. A parte difícil é decidir qual delas pode realmente machucar alguém.',
    ],
  },
};

export const defaultDialogueProfile: NpcDialogueProfile = {
  background: [
    'Minha história ainda está começando por aqui.',
    'Ainda tenho muito para descobrir sobre a vila e sobre mim.',
  ],
  dreams: [
    'Quero descobrir qual lugar vou ocupar em Aster quando crescer.',
    'Ainda tenho tempo para decidir o que quero fazer da vida.',
  ],
  worries: [
    'Algumas coisas na vila parecem estranhas até para quem ainda está crescendo.',
    'Eu me preocupo quando os adultos ficam preocupados e fingem que não estão.',
  ],
  leisure: [
    'Gosto de brincar e explorar.',
    'Sempre encontro alguma coisa nova para fazer perto da praça.',
  ],
  favoritePlaces: [
    'A praça. Sempre tem alguma coisa acontecendo.',
    'Gosto de ficar perto de casa e depois sair correndo pela vila.',
  ],
  values: [
    'Acho importante ter gente em quem confiar.',
    'Gosto de quem leva criança a sério quando ela fala.',
  ],
  workFeelings: [
    'Ainda não tenho trabalho. Minha responsabilidade é crescer sem causar problema demais.',
  ],
  trustedConfessions: [
    'Às vezes eu escuto os adultos conversando quando acham que ninguém está prestando atenção.',
  ],
};

export function dialogueProfileFor(id: string): NpcDialogueProfile {
  return npcDialogueProfiles[id] ?? defaultDialogueProfile;
}
