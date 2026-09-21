# Generative NPC — v0.6.1 Local NPC AI

A camada generativa existe para linguagem e memória conversacional. Ela roda diretamente no navegador e não substitui a Life Simulation nem a Utility AI.

## Fluxo

```text
jogador pressiona F
      ↓
GenerativeDialogueSystem
      ↓
contexto mínimo daquele NPC
      ↓
WebLLM
      ↓
WebGPU do dispositivo
      ↓
modelo aberto local
      ↓
fala do NPC
      ↓
SaveSystem local
```

## Modelos

O sistema tenta, nesta ordem:

```text
Llama-3.2-1B-Instruct-q4f16_1-MLC
SmolLM2-360M-Instruct-q4f32_1-MLC
```

O primeiro prioriza qualidade. O segundo é um fallback mais leve.

## Download e cache

Na primeira conversa livre, o WebLLM baixa o modelo escolhido. O progresso aparece no painel de conversa.

Depois do primeiro carregamento, os artefatos ficam no cache do navegador e são reutilizados nas sessões seguintes.

## Conhecimento limitado

O prompt local contém apenas:

- identidade do NPC;
- personalidade;
- profissão;
- atividade atual;
- situação familiar;
- localização e horário;
- fatos presentes na memória daquele NPC;
- resumo e histórico curto da conversa.

Se o NPC não conhece um fato, ele é instruído a admitir que não sabe em vez de inventar lore.

## Memória curta e longa

### Curta

O save mantém os últimos 8 turnos da conversa daquele NPC.

### Longa

O cliente mantém um resumo compacto dos intercâmbios anteriores, limitado a 900 caracteres.

### Fatos explícitos

Fatos simples ditos pelo jogador são extraídos deterministicamente, sem depender do modelo.

Exemplos reconhecidos:

- "meu nome é ...";
- "eu vim de ...";
- "eu moro em ...";
- "eu gosto de ...";
- "eu não gosto de ...";
- "eu trabalho como/com ...".

Esses fatos entram na Memory v2 com `source = player`.

## Autoridade

O modelo pode:

- conversar;
- reagir;
- expressar opinião coerente com sua personalidade;
- mencionar memórias recebidas.

O modelo não pode:

- criar item;
- concluir quest;
- casar NPCs;
- gerar filhos;
- alterar dinheiro;
- mover personagem;
- mudar BrainAction;
- modificar estado canônico.

## Compatibilidade

WebLLM depende de WebGPU. Quando WebGPU não estiver disponível, ou se nenhum modelo puder ser carregado, a conversa livre usa automaticamente o fallback determinístico já existente.

## Custos e configuração

- nenhuma chave;
- nenhuma variável de ambiente;
- nenhum servidor de IA;
- nenhum custo por token;
- nenhuma dependência da OpenAI.

A única despesa de infraestrutura continua sendo a hospedagem normal do jogo, caso o plano de hospedagem ultrapasse seus próprios limites.
