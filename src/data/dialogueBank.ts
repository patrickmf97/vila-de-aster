export type DialogueTone =
  | 'warm'
  | 'reserved'
  | 'curious'
  | 'disciplined'
  | 'social'
  | 'neutral';

export const dialogueBank = {
  acknowledgements: [
    'Entendo.',
    'Faz sentido.',
    'Interessante.',
    'Hm... isso me faz pensar.',
    'É uma boa pergunta.',
    'Nunca tinha pensado exatamente desse jeito.',
    'Pode ser.',
    'Eu consigo entender por que você perguntou isso.',
  ],
  unknown: [
    'Não sei o bastante para afirmar isso.',
    'Prefiro dizer que não sei do que inventar uma resposta.',
    'Ainda não ouvi nada confiável sobre isso.',
    'Talvez outro morador saiba mais do que eu.',
    'Isso está fora do que eu conheço por enquanto.',
    'Não tenho certeza. Em Aster, boato vira verdade rápido demais.',
  ],
  greeting: {
    warm: [
      'Que bom te ver por aqui.',
      'Oi! Sempre cabe mais uma conversa no meu dia.',
      'Você voltou. Gosto quando as pessoas não passam por Aster com pressa.',
      'Olá! Como está sendo seu dia por aqui?',
    ],
    reserved: [
      'Olá.',
      'Você de novo. Tudo certo?',
      'Pois não?',
      'Oi. Precisa de alguma coisa?',
    ],
    curious: [
      'Oi! Descobriu alguma coisa interessante desde a última vez?',
      'Você voltou. Então, alguma novidade?',
      'Olá. Seu jeito de olhar em volta diz que ainda está procurando respostas.',
      'Oi! Aposto que veio com outra pergunta.',
    ],
    disciplined: [
      'Olá. Posso conversar um pouco antes de voltar ao que estava fazendo.',
      'Oi. Estou no meio do trabalho, mas diga.',
      'Você chegou numa boa hora. Tenho alguns minutos.',
      'Olá. O dia está corrido, mas estou ouvindo.',
    ],
    social: [
      'Olha quem apareceu! Vem, me conta alguma coisa.',
      'Oi! Já estava na hora de alguém puxar conversa.',
      'Você voltou! Senta aí — quer dizer, se tivesse cadeira aqui.',
      'Olá! Aster fica menos silenciosa quando alguém resolve conversar.',
    ],
    neutral: [
      'Olá.',
      'Oi, tudo bem?',
      'Você voltou.',
      'Pois não?',
    ],
  },
  wellbeing: {
    high: [
      'Estou bem hoje.',
      'Tenho energia de sobra.',
      'Hoje o dia começou melhor do que eu esperava.',
      'Estou tranquilo por enquanto.',
    ],
    medium: [
      'Estou bem, só um pouco ocupado.',
      'Nada demais. Só o cansaço normal de um dia em Aster.',
      'Estou levando.',
      'Já tive dias melhores, mas não posso reclamar.',
    ],
    low: [
      'Estou cansado. Acho que preciso diminuir o ritmo.',
      'Hoje o corpo está pedindo descanso.',
      'Sinceramente? Estou precisando dormir mais.',
      'Estou funcionando mais na força do hábito do que na energia.',
    ],
  },
  village: [
    'Aster é pequena. Isso significa que todo mundo conhece alguma coisa sobre todo mundo.',
    'A vila parece calma de longe, mas sempre tem alguma história acontecendo em uma porta fechada.',
    'Eu gosto daqui. Mesmo quando as coisas ficam estranhas, ainda é nossa casa.',
    'Em Aster, praça, taverna e rio carregam mais histórias do que qualquer livro.',
    'A vila muda devagar, mas quando muda, todo mundo sente.',
  ],
  riverKnown: [
    'O rio não está normal. Quem convive com ele percebe isso antes de qualquer anúncio oficial.',
    'Depois daquele tremor, ficou difícil fingir que não existe alguma coisa acontecendo perto da água.',
    'Tem alguma coisa errada perto do rio. Ainda não sei exatamente o quê.',
    'As histórias sobre o rio não combinam entre si, e isso me preocupa mais do que se todos contassem a mesma coisa.',
  ],
  riverUnknown: [
    'Ouvi comentários sobre o rio, mas ainda não sei nada que eu possa chamar de fato.',
    'Tem gente falando do rio, mas eu prefiro esperar antes de repetir boato.',
    'Ainda não vi nada com meus próprios olhos.',
    'Talvez Theo saiba mais. Ele passa muito mais tempo perto da água do que eu.',
  ],
  memoryIntro: [
    'Eu lembro disso sobre você:',
    'Se minha memória não está me enganando,',
    'Você já me contou algumas coisas.',
    'Tem algumas coisas suas que eu guardei na cabeça:',
  ],
  familySingle: [
    'Ainda não formei uma família por aqui.',
    'Minha história familiar ainda está sendo escrita.',
    'Por enquanto, minha casa é mais silenciosa do que talvez seja no futuro.',
    'Ainda não tenho parceiro nem filhos.',
  ],
  familyPartner: [
    'Ter alguém ao lado muda completamente a forma como a gente enxerga a vila.',
    'Dividir a vida com alguém faz até uma casa pequena parecer diferente.',
    'Relacionamento dá trabalho, mas também dá sentido para muita coisa.',
    'A vida ficou menos solitária desde que passei a dividir meus dias com alguém.',
  ],
  familyChildren: [
    'Quando tem criança em casa, silêncio vira artigo de luxo.',
    'Ter filhos muda as prioridades mais rápido do que qualquer calendário.',
    'A casa ficou mais bagunçada e muito mais viva.',
    'Depois que uma criança entra na família, cada dia parece um pouco diferente.',
  ],
  relationshipPositive: [
    'Gosto bastante de {name}.',
    '{name} é alguém em quem eu confio.',
    'Eu me dou muito bem com {name}.',
    'Tenho bastante respeito por {name}.',
  ],
  relationshipNeutral: [
    'Eu me dou bem com {name}.',
    'Conheço {name} razoavelmente bem.',
    '{name} parece uma boa pessoa pelo que convivi até agora.',
    'Ainda estou conhecendo melhor {name}.',
  ],
  relationshipUnknown: [
    'Não convivi o suficiente com {name} para formar uma opinião forte.',
    'Conheço {name}, mas ainda não diria que conheço de verdade.',
    'Ainda não tive muitas oportunidades de conversar com {name}.',
    'Seria injusto eu inventar uma opinião sobre {name}.',
  ],
  followUps: [
    'Por que perguntou?',
    'Você pensa diferente?',
    'Aconteceu alguma coisa?',
    'E você, o que acha?',
    'Tem algum motivo especial para querer saber disso?',
  ],
  personality: {
    warm: [
      'Eu tento prestar atenção em como as pessoas ao meu redor estão.',
      'Para mim, cuidar de gente importa tanto quanto cuidar do trabalho.',
      'Acho difícil ignorar quando alguém parece precisar de ajuda.',
    ],
    reserved: [
      'Eu não sou de falar demais sem ter certeza.',
      'Prefiro observar primeiro e falar depois.',
      'Nem todo pensamento precisa virar conversa.',
    ],
    curious: [
      'É difícil para mim deixar uma pergunta sem resposta.',
      'Quando alguma coisa não faz sentido, eu acabo pensando nisso por horas.',
      'Curiosidade já me colocou em problemas mais de uma vez.',
    ],
    disciplined: [
      'Gosto de terminar aquilo que começo.',
      'Rotina ajuda a manter a cabeça no lugar.',
      'Trabalho bem feito fala mais alto que promessa.',
    ],
    social: [
      'Eu gosto de saber o que está acontecendo com as pessoas.',
      'Uma boa conversa resolve mais coisa do que muita gente imagina.',
      'Ficar sem conversar com ninguém o dia inteiro seria um castigo para mim.',
    ],
    neutral: [
      'Eu tento levar as coisas no meu ritmo.',
      'Cada dia tem suas próprias preocupações.',
      'Não sou muito de extremos.',
    ],
  },
  profession: {
    Jardineira: [
      'Cuido das flores e dos jardins. Planta fala sem palavras, mas precisa saber observar.',
      'Meu trabalho é cuidar do que cresce por aqui. Ultimamente algumas plantas estão me preocupando.',
      'Passo boa parte do dia entre terra, folhas e flores.',
    ],
    Ferreiro: [
      'Trabalho na forja. Metal não mente: ou foi bem trabalhado ou não foi.',
      'Faço e conserto ferramentas. Às vezes uma lâmina conta muito sobre quem a usou.',
      'Meu dia normalmente envolve fogo, metal e bastante barulho.',
    ],
    Comerciante: [
      'Cuido do empório. Mercadoria entra, mercadoria sai e notícia chega junto.',
      'Meu trabalho é manter o comércio funcionando. Isso significa saber o que está faltando antes de todo mundo.',
      'Vendo um pouco de tudo, e acabo ouvindo um pouco de tudo também.',
    ],
    Pescador: [
      'Vivo da pesca. Conheço o rio melhor do que conheço algumas pessoas daqui.',
      'Passo boa parte do dia pescando. Quando a água muda, eu noto.',
      'Peixe não fala, mas o comportamento deles conta bastante coisa.',
    ],
    Taverneira: [
      'Cuido da taverna. Comida, bebida e conversa nunca faltam por muito tempo.',
      'Meu trabalho é manter a taverna funcionando e os clientes minimamente felizes.',
      'Quem trabalha em taverna acaba ouvindo histórias que nunca pediu para ouvir.',
    ],
    Criança: [
      'Ainda não trabalho. Tenho coisas muito mais importantes para fazer, tipo brincar.',
      'Minha profissão atual é fazer perguntas e correr pela praça.',
      'Os adultos trabalham; eu observo e aprendo.',
    ],
  },
} as const;

export function pickDialogue<T extends readonly string[]>(
  values: T,
  seed: number,
): string {
  if (!values.length) return '';
  return values[Math.abs(seed) % values.length]!;
}

export function fillDialogue(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll('{' + key + '}', value),
    template,
  );
}
