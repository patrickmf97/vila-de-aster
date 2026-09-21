# Vila de Aster

RPG 2D top-down para navegador com foco em **mundo vivo, memória, relações, família, decisões autônomas e diálogo generativo**.

## Estado atual — v0.6.0 Generative NPC

Os moradores agora podem conversar livremente com o jogador sem abandonar a arquitetura local do jogo.

### O que existe nesta versão

- tecla **E** mantém o diálogo rápido/local;
- tecla **F** abre conversa livre com o NPC;
- backend seguro em `/api/npc-chat`;
- chave da OpenAI permanece apenas no servidor;
- contexto limitado à personalidade, estado, relações e fatos que o NPC realmente conhece;
- histórico curto por NPC;
- resumo persistente da relação/conversa;
- fatos explícitos ditos pelo jogador podem entrar na memória do NPC;
- resposta estruturada;
- `store: false` nas chamadas da Responses API;
- fallback local se a IA, rede ou configuração estiver indisponível;
- Utility AI continua controlando comportamento, e não o modelo generativo.

## Como rodar

Instalação:

```bash
npm install
```

Frontend local com fallback de diálogo:

```bash
npm run dev
```

Para testar também as funções `/api` localmente, use um ambiente Vercel ligado ao projeto:

```bash
vercel dev
```

Build completo, incluindo typecheck da função de IA:

```bash
npm run build
```

## Variáveis de ambiente

Copie `.env.example` como referência.

No Vercel, configure como variáveis **server-side**:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
```

Nunca use prefixo `VITE_` para a chave.

## Controles

- WASD / setas: mover
- E / Enter: diálogo local
- F: conversa livre com IA
- B: painel NPC Brain
- R: reiniciar memória e simulação

## Arquitetura

```text
Phaser / navegador
      ↓
GenerativeDialogueSystem
      ↓
POST /api/npc-chat
      ↓
Vercel Function
      ↓
OpenAI Responses API
```

O modelo generativo não altera diretamente quests, inventário, casamento, filhos ou estado canônico.

Documentação técnica:

- `docs/LIFE_SIMULATION.md`
- `docs/NPC_BRAIN.md`
- `docs/GENERATIVE_NPC.md`

## Próximo marco

**v0.7.0 — Economy & Settlement**: dinheiro por NPC, produção/consumo, recursos, custo de vida, construção de novas casas e expansão física da vila.
