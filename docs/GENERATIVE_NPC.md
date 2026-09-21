# Generative NPC — v0.6

A camada generativa existe para linguagem e memória conversacional. Ela não substitui a simulação nem a Utility AI.

## Fluxo

```text
jogador pressiona F
      ↓
GenerativeDialogueSystem
      ↓
contexto mínimo daquele NPC
      ↓
POST /api/npc-chat
      ↓
OpenAI Responses API
      ↓
reply + memory + summary
      ↓
SaveSystem
```

## Conhecimento limitado

O backend recebe apenas os fatos que já existem na memória daquele NPC.

Se Bram não sabe de um acontecimento, o prompt exige que ele admita não saber em vez de inventar.

## Memória curta e longa

### Curta

O save mantém os últimos 8 turnos da conversa daquele NPC.

### Longa

Cada resposta pode atualizar um resumo de até 900 caracteres.

O resumo volta como contexto nas conversas seguintes, permitindo continuidade sem enviar um histórico ilimitado.

### Fatos

O modelo pode sugerir um único fato durável explicitamente dito pelo jogador.

Exemplo:

```text
Jogador: Meu nome é Patrick e eu vim da cidade do sul.

memory:
"Patrick disse que veio da cidade do sul."
```

O fato entra na Memory v2 com `source = player`.

## Autoridade

O modelo pode:

- conversar;
- reagir;
- expressar opinião coerente com personalidade;
- mencionar memórias que recebeu;
- resumir conversa.

O modelo não pode:

- criar item;
- concluir quest;
- casar NPCs;
- gerar filhos;
- alterar dinheiro;
- mover personagem;
- mudar BrainAction;
- modificar estado canônico.

Essas ações continuam pertencendo aos sistemas determinísticos.

## Backend

Arquivo:

```text
api/npc-chat.ts
```

Variáveis:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

A API usa:

- payload limitado;
- máximo de 8 turnos;
- máximo de 12 fatos;
- mensagem de até 320 caracteres;
- JSON Schema para saída estruturada;
- `store: false`;
- rate limit básico em memória;
- timeout do cliente;
- fallback local.

## Desenvolvimento local

`npm run dev` executa apenas o Vite, portanto a conversa livre cairá no fallback local se `/api/npc-chat` não existir.

Para testar a função junto com o frontend, use `vercel dev` em um projeto Vercel configurado com as variáveis de ambiente.
