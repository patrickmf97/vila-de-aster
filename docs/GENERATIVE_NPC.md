# Generative NPC — v0.6.2

A IA conversacional roda localmente no dispositivo do jogador.

## Seleção automática de backend

```text
pressiona F
   ↓
há WebGPU?
   ├─ sim → WebLLM
   │        ├─ Llama 3.2 1B
   │        └─ SmolLM2 360M
   │
   └─ não → Transformers.js
            ↓
            WASM / CPU
            ↓
            SmolLM2 135M Instruct q4
```

Se todos os modelos falharem, o sistema usa diálogo determinístico.

## Por que existe o fallback CPU

Alguns navegadores e drivers não expõem WebGPU. A rota WASM usa CPU e tem compatibilidade maior, embora seja mais lenta.

## Modelo CPU

```text
onnx-community/SmolLM2-135M-Instruct-ONNX
dtype: q4
device: wasm
```

O modelo quantizado é baixado sob demanda e reutilizado pelo cache do navegador.

## Contexto

Cada NPC recebe somente:

- identidade;
- profissão;
- personalidade;
- atividade atual;
- família;
- horário/local;
- fatos que conhece;
- resumo da conversa;
- histórico curto.

## Autoridade

A IA conversa, mas não altera quests, itens, casamento, filhos, dinheiro, movimento ou decisões da Utility AI.

## Custos

- sem OpenAI;
- sem API key;
- sem backend de IA;
- sem cobrança por token.
